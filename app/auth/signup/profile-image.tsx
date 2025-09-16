import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import Loading from "@/src/features/loading";
import Signup from "@/src/features/signup";
import type { SignupForm } from "@/src/features/signup/hooks";
import { useModal } from "@/src/shared/hooks/use-modal";
import {
  GuideView,
  guideHeight,
  useOverlay,
} from "@/src/shared/hooks/use-overlay";
import { tryCatch } from "@/src/shared/libs";
import { cn } from "@/src/shared/libs/cn";
import { platform } from "@/src/shared/libs/platform";
import { Button, ImageSelector } from "@/src/shared/ui";
import { Text } from "@/src/shared/ui/text";
import { track } from "@amplitude/analytics-react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Platform,
  Text as RNText,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { z } from "zod";

import { useStorage } from "@/src/shared/hooks/use-storage";
import { useTranslation } from "react-i18next";

const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  apis,
  useSignupAnalytics,
} = Signup;

const { height } = Dimensions.get("window");

type FormState = {
  images: (string | null)[];
};

const schema = z.object({
  images: z
    .array(z.string().nullable())
    .min(3, { message: "3장의 사진을 올려주세요" })
    .refine((images) => images.every((img) => img !== null), {
      message: "3장의 사진을 올려주세요",
    }),
});

export default function ProfilePage() {
  const { updateForm, form: userForm } = useSignupProgress();
  const [images, setImages] = useState<(string | null)[]>(
    userForm.profileImages ?? [null, null, null]
  );
  const { showErrorModal } = useModal();
  const [signupLoading, setSignupLoading] = useState(false);
  const { trackSignupEvent } = useSignupAnalytics("profile_image");
  const { showOverlay, hideOverlay, visible } = useOverlay();
  const animation = useRef(new Animated.Value(0)).current;

  const { value: appleUserIdFromStorage, loading: storageLoading } = useStorage<
    string | null
  >({ key: "appleUserId" });
  const { removeValue: removeAppleUserId } = useStorage({ key: "appleUserId" });
  const { value: loginTypeStorage } = useStorage<string | null>({
    key: "loginType",
  });
  const { removeValue: removeLoginType } = useStorage({ key: "loginType" });

  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      images: userForm.profileImages ?? [null, null, null],
    },
  });

  const {t} = useTranslation();

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.delay(height <= guideHeight ? 500 : 0),
        Animated.timing(animation, {
          toValue: 1,
          duration: height <= guideHeight ? 500 : 0,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  useEffect(() => {
    showOverlay(
      <View style={styles.infoOverlayWrapper}>
        <RNText style={styles.infoTitle}>
          {t("apps.auth.sign_up.profile_image.info_title")}
        </RNText>
        <RNText style={styles.infoDescription}>
          {t("apps.auth.sign_up.profile_image.info_desc_1")}
        </RNText>
        <RNText style={styles.infoDescription}>{t("apps.auth.sign_up.profile_image.info_desc_2")}</RNText>
        <Image
          source={require("@assets/images/instagram-some.png")}
          style={{
            width: 116,
            height: 175,
            position: "absolute",
            top: 20,
            right: -66,
          }}
        />
        <Image
          source={require("@assets/images/instagram-lock.png")}
          style={{
            width: 52,
            height: 52,
            position: "absolute",
            top: -30,
            left: -30,
            transform: [{ rotate: "-10deg" }],
          }}
        />
      </View>
    );
  }, []);

  const onNext = async () => {
    const signupForm = {
      ...userForm,
      profileImages: images.filter(Boolean) as string[],
    };

    updateForm(signupForm);
    setSignupLoading(true);

    await tryCatch(
      async () => {
        if (Platform.OS === "ios" && loginTypeStorage === "apple") {
          if (appleUserIdFromStorage) {
            signupForm.appleId = appleUserIdFromStorage;
          } else {
            await removeAppleUserId();
            await removeLoginType();
            showErrorModal("애플 로그인 정보가 없습니다.", "announcement");
            router.push("/auth/login");
            return;
          }
        } else if (
          Platform.OS === "web" &&
          sessionStorage.getItem("loginType") === "apple"
        ) {
          const appleIdFromSession = sessionStorage.getItem("appleUserId");
          if (appleIdFromSession) {
            signupForm.appleId = appleIdFromSession;
          } else {
            sessionStorage.removeItem("appleUserId");
            sessionStorage.removeItem("loginType");
            showErrorModal("애플 로그인 정보가 없습니다.", "announcement");
            router.push("/auth/login");
            return;
          }
        }

        if (!signupForm.phone) {
          showErrorModal("휴대폰 번호가 없습니다", "announcement");
          trackSignupEvent("signup_error", "missing_phone");
          track("Signup_profile_image_error", {
            error: "휴대폰 번호가 없습니다.",
            env: process.env.EXPO_PUBLIC_TRACKING_MODE,
          });
          router.push("/auth/login");
          return;
        }

        const { exists } = await apis.checkPhoneNumberExists(signupForm.phone);

        if (exists) {
          showErrorModal("이미 가입된 사용자입니다", "announcement");
          track("Signup_profile_image_error", {
            error: "이미 가입된 사용자입니다",
            env: process.env.EXPO_PUBLIC_TRACKING_MODE,
          });
          trackSignupEvent("signup_error", "phone_already_exists");

          if (Platform.OS === "ios") {
            await removeLoginType();
          } else if (Platform.OS === "web") {
            sessionStorage.removeItem("loginType");
          }

          router.push("/auth/login");
          return;
        }
        if (!signupForm.universityName || !signupForm.departmentName) {
          showErrorModal("학교와 학과 정보가 필요해요.", "announcement");
          router.navigate("/auth/signup/area");
          return;
        }
        await apis.signup(signupForm as SignupForm);
        track("Signup_profile_image", {
          success: true,
          env: process.env.EXPO_PUBLIC_TRACKING_MODE,
        });
        trackSignupEvent("signup_complete");

        if (Platform.OS === "ios") {
          await removeLoginType();
        } else if (Platform.OS === "web") {
          sessionStorage.removeItem("loginType");
        }

        router.push("/auth/signup/done");
      },
      (error) => {
        console.error("Signup error:", error);
        track("Signup_profile_image_error", {
          error: error,
          env: process.env.EXPO_PUBLIC_TRACKING_MODE,
        });
        trackSignupEvent("signup_error", error.error);
        showErrorModal(error.error, "announcement");
      }
    );

    setSignupLoading(false);
  };

  const nextable = images.every((image) => image !== null);

  const uploadImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  useChangePhase(SignupSteps.PROFILE_IMAGE);

  useEffect(() => {
    form.setValue("images", images);
  }, [images, form]);

  useEffect(() => {
    const onBackPress = () => {
      router.navigate("/auth/signup/instagram");
      return true;
    };

    // 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => subscription.remove();
  }, []);

  if (signupLoading || storageLoading) {
    return <Loading.Page />;
  }

  return (
    <DefaultLayout className="flex-1 relative">
      <GuideView>
        <View className="px-5 ">
          <Image
            source={require("@assets/images/profile-image.png")}
            style={{ width: 81, height: 81 }}
          />
          <Text weight="semibold" size="20" textColor="black" className="mt-2">
            {t("apps.auth.sign_up.profile_image.main_title_1")}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.auth.sign_up.profile_image.main_title_2")} 
          </Text>
        </View>

        <View className="flex flex-col pb-[18px] pt-4 px-5">
          <Text weight="medium" size="sm" textColor="pale-purple">
            {t("apps.auth.sign_up.profile_image.guide_1")}
          </Text>
          <Text weight="medium" size="sm" textColor="pale-purple">
            {t("apps.auth.sign_up.profile_image.guide_2")}
          </Text>
        </View>

        <View className="flex-row justify-center   w-full gap-[16px]">
          <View className="flex  justify-center items-center">
            <ImageSelector
              size="lg"
              value={images[0] ?? undefined}
              onChange={(value) => {
                trackSignupEvent("image_upload", "image_1");
                track("Signup_profile_image_1", {
                  env: process.env.EXPO_PUBLIC_TRACKING_MODE,
                });
                uploadImage(0, value);
                form.trigger("images");
              }}
            />
          </View>

          <View className="flex flex-col justify-center gap-y-[12px]">
            <ImageSelector
              size="sm"
              value={images[1] ?? undefined}
              onChange={(value) => {
                trackSignupEvent("image_upload", "image_2");
                track("Signup_profile_image_2", {
                  env: process.env.EXPO_PUBLIC_TRACKING_MODE,
                });
                uploadImage(1, value);
                form.trigger("images");
              }}
            />
            <ImageSelector
              size="sm"
              value={images[2] ?? undefined}
              onChange={(value) => {
                trackSignupEvent("image_upload", "image_3");
                track("Signup_profile_image_3", {
                  env: process.env.EXPO_PUBLIC_TRACKING_MODE,
                });
                uploadImage(2, value);
                form.trigger("images");
              }}
            />
          </View>
        </View>

        {!visible && (
          <Animated.View
            style={[
              height < guideHeight
                ? styles.infoWrapper
                : styles.infoOverlayWrapper,
              { marginTop: 40, opacity: animation },
            ]}
          >
            <RNText style={styles.infoTitle}>
              {t("apps.auth.sign_up.profile_image.info_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("apps.auth.sign_up.profile_image.info_desc_1")}
            </RNText>
            <RNText style={styles.infoDescription}>{t("apps.auth.sign_up.profile_image.info_desc_2")}</RNText>
            <Image
              source={require("@assets/images/instagram-some.png")}
              style={{
                width: 116,
                height: 175,
                position: "absolute",
                top: 20,
                right: -66,
              }}
            />
            <Image
              source={require("@assets/images/instagram-lock.png")}
              style={{
                width: 52,
                height: 52,
                position: "absolute",
                top: -30,
                left: -30,
                transform: [{ rotate: "-10deg" }],
              }}
            />
          </Animated.View>
        )}
      </GuideView>

      <View style={[styles.bottomContainer]} className="w-[calc(100%)]">
        <TwoButtons
          disabledNext={!nextable}
          onClickNext={onNext}
          content={{ next: "완료하기" }}
          onClickPrevious={() => {
            trackSignupEvent("back_button_click", "to_university_details");
            router.push("/auth/signup/instagram");
          }}
        />
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  infoOverlayWrapper: {
    bottom: 200,
    position: "absolute",

    right: 90,
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: "#F2ECFF",
    borderWidth: 1,
    borderColor: "#FFF",

    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // Android에서 그림자
  },
  infoWrapper: {
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: "#F2ECFF",
    borderWidth: 1,
    borderColor: "#FFF",
    marginBottom: 223,
    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // Android에서 그림자
  },
  infoTitle: {
    color: "#9F84D8",
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16.8,
    fontSize: 14,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 11,
    lineHeight: 13.2,
    color: "#BAB0D0",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: "#fff",
  },
});
