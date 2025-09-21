import { useModal } from "@/src/shared/hooks/use-modal";
import { guideHeight, useOverlay } from "@/src/shared/hooks/use-overlay";
import { useStorage } from "@/src/shared/hooks/use-storage";
import { tryCatch } from "@/src/shared/libs";
import { track } from "@amplitude/analytics-react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { z } from "zod";
import Signup from "..";
import {
  buildSignupForm,
  ensureAppleId,
  processSignup,
  validatePhone,
  validateUniversity,
} from "../services/signup-validator";
import type { SignupForm } from "./use-signup-progress";

const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  apis,
  useSignupAnalytics,
} = Signup;

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

const { height } = Dimensions.get("window");

function useProfileImage() {
  const router = useRouter();
  const { updateForm, form: userForm } = useSignupProgress();
  const [images, setImages] = useState<(string | null)[]>(
    userForm.profileImages ?? [null, null, null]
  );
  const { showErrorModal } = useModal();
  const [signupLoading, setSignupLoading] = useState(false);
  const { trackSignupEvent } = useSignupAnalytics("profile_image");
  const { showOverlay, hideOverlay, visible } = useOverlay();

  const getImaages = (index: number) => {
    return images[index] ?? undefined;
  };

  const { value: appleUserIdFromStorage, loading: storageLoading } = useStorage<
    string | null
  >({
    key: "appleUserId",
  });
  const { removeValue: removeAppleUserId } = useStorage({
    key: "appleUserId",
  });
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

  useEffect(() => {
    showOverlay(
      <View style={styles.infoOverlayWrapper}>
        <Text style={styles.infoTitle}>이목구비가 잘 보이는 사진 필수에요</Text>
        <Text style={styles.infoDescription}>
          눈, 코, 입이 잘 보이는 사진이라면
        </Text>
        <Text style={styles.infoDescription}>어떤 각도든 좋아요</Text>
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
    setSignupLoading(true);

    const signupForm = buildSignupForm(userForm, images);
    updateForm(signupForm);

    await tryCatch(
      async () => {
        const appleOk = await ensureAppleId(signupForm, {
          router,
          loginTypeStorage,
          appleUserIdFromStorage,
          removeAppleUserId,
          removeLoginType,
          showErrorModal,
        });
        if (!appleOk) return;

        const phoneOk = await validatePhone(signupForm, {
          router,
          apis,
          trackSignupEvent,
          track,
          showErrorModal,
          removeLoginType,
        });
        if (!phoneOk) return;

        const universityOk = validateUniversity(signupForm, {
          router,
          showErrorModal,
        });
        if (!universityOk) return;

        await processSignup(signupForm, {
          router,
          apis,
          track,
          trackSignupEvent,
          removeLoginType,
        });
      },
      (error) => {
        console.error("Signup error:", error);
        track("Signup_profile_image_error", {
          error,
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
    trackSignupEvent("image_upload", `image_${index + 1}`);
    track(`Signup_profile_image_${index + 1}`, {
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
    form.trigger("images");
  };

  const onBackPress = () => {
    router.push("/auth/signup/instagram");
    return true;
  };

  useChangePhase(SignupSteps.PROFILE_IMAGE);

  useEffect(() => {
    form.setValue("images", images);
  }, [images, form]);

  useEffect(() => {
    // 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => subscription.remove();
  }, []);

  return {
    getImaages,
    visible,
    nextable,
    signupLoading,
    storageLoading,
    uploadImage,
    onNext,
    onBackPress,
  };
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

export default useProfileImage;
