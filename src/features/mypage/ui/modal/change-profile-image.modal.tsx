import { useAuth } from "@/src/features/auth/hooks/use-auth";
import apis from "@/src/features/mypage/apis";
import { platform } from "@/src/shared/libs/platform";

import Layout from "@/src/features/layout";
import { DefaultLayout } from "@/src/features/layout/ui";
import { useModal } from "@/src/shared/hooks/use-modal";
import {
  GuideView,
  guideHeight,
  useOverlay,
} from "@/src/shared/hooks/use-overlay";
import { useStorage } from "@/src/shared/hooks/use-storage";
import { cn } from "@/src/shared/libs";
import {
  Button,
  ImageSelector,
  PalePurpleGradient,
  Text,
} from "@/src/shared/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Text as RNText,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";


interface ChangeProfileImageModalProps {
  onCloseModal: () => void;
}

const { height } = Dimensions.get("window");

export const ChangeProfileImageModal = ({
  onCloseModal,
}: ChangeProfileImageModalProps) => {
  const { hideModal, showErrorModal } = useModal();
  const insets = useSafeAreaInsets();
  const { profileDetails } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showOverlay, hideOverlay, visible } = useOverlay();
  const animation = useRef(new Animated.Value(0)).current;

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
      <View style={styles.infoContainer}>
        <View style={styles.infoOverlayWrapper}>
          <RNText style={styles.infoTitle}>
            이목구비가 잘 보이는 사진 필수에요
          </RNText>
          <RNText style={styles.infoDescription}>
            눈, 코, 입이 잘 보이는 사진이라면
          </RNText>
          <RNText style={styles.infoDescription}>어떤 각도든 좋아요</RNText>
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
      </View>
    );
  }, []);

  useEffect(() => {
    if (profileDetails?.profileImages) {
      const sortedPorifleImages = profileDetails?.profileImages.sort((a, b) => {
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        return 0;
      });
      setImages(sortedPorifleImages.map((item) => item.url));
    }
  }, [profileDetails]);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addNewImage = async (newImage: string[]) => {
    await apis.uploadProfileImages(newImage);
  };

  const cleanupRemainingImages = async (
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    oldImages: any[]
  ) => {
    for (let i = 0; i < oldImages.length; i++) {
      await apis.deleteProfileImage(oldImages[i].id).catch(() => {});
    }
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const getErrorMessage = (error: any) => {
    console.log("error", error);
    return (
      error?.response?.data?.message ||
      error?.message ||
      error?.error ||
      t("features.mypage.unknown_error")
    );
  };

  const handleSubmit = async () => {
    if (!profileDetails) {
      showErrorModal(t("features.mypage.profile_image_error_load"), "error");
      return;
    }

    const validImages = images.filter((img) => img !== null) as string[];
    if (validImages.length !== 3) {
      showErrorModal(t("features.mypage.profile_image_error_count"), "announcement");
      return;
    }

    try {
      setIsSubmitting(true);

      const oldImages = [...(profileDetails.profileImages || [])];
      const changedIndexes: number[] = [];

      images.forEach((img, idx) => {
        const oldImage = oldImages[idx]?.url ?? null;
        if (img !== oldImage) {
          changedIndexes.push(idx);
        }
      });

      for (const index of changedIndexes) {
        const oldImage = oldImages[index];
        if (oldImage) {
          await apis.deleteProfileImage(oldImage.id).catch(() => {});
        }
      }

      for (const index of changedIndexes) {
        const newImage = images[index];
        if (newImage) {
          await apis.uploadProfileImage(newImage, index);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["my-profile-details"] });
      hideModal();

      setTimeout(() => {
        showErrorModal(
          t("features.mypage.profile_image_success"),
          "announcement"
        );
      }, 100);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      showErrorModal(
        `${t("features.mypage.profile_image_error_change")}${getErrorMessage(error)}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
      onCloseModal();
    }
  };

  if (!profileDetails) {
    return (
      <View className="items-center justify-center p-4">
        <ActivityIndicator size="large" color="#6A3EA1" />
        <Text className="mt-2 text-center" textColor="black">
          {t("features.mypage.profile_image_loading")}
        </Text>
      </View>
    );
  }

  return (
    <DefaultLayout
      className={cn(
        "flex-1 ",
        Platform.OS === "web" && "max-w-[468px] relative w-full self-center"
      )}
    >
      <View style={{ flex: 1 }}>
        <GuideView>
          <View style={[styles.container]}>
            <View style={styles.titleContainer}>
              <Image
                source={require("@assets/images/profile-image.png")}
                style={{ width: 102, height: 102 }}
              />
              <Text
                weight="semibold"
                size="20"
                textColor="black"
                className="mt-2"
              >
                {t("features.mypage.profile_image_no_match")}
              </Text>
              <Text weight="semibold" size="20" textColor="black">
                {t("features.mypage.profile_image_add_now")}
              </Text>
            </View>

            <View style={styles.descriptioncontianer}>
              <Text weight="medium" size="sm" textColor="pale-purple">
                {t("features.mypage.profile_image_required_one")}
              </Text>
              <Text weight="medium" size="sm" textColor="pale-purple">
                {t("features.mypage.profile_image_face_visible")}
              </Text>
            </View>

            <View className="flex-row justify-center px-[8px]  w-full gap-[16px]">
              <View className="flex  justify-center items-center">
                {images[0] ? (
                  <ImageSelector
                    size="lg"
                    actionLabel={t("features.mypage.representative")}
                    value={images[0]}
                    onChange={(value) => {
                      handleImageChange(0, value);
                    }}
                  />
                ) : (
                  <ImageSelector
                    size="lg"
                    actionLabel={t("features.mypage.representative")}
                    value={undefined}
                    onChange={(value) => {
                      handleImageChange(0, value);
                    }}
                  />
                )}
              </View>

              <View className="flex flex-col justify-center gap-y-[12px]">
                {images[1] ? (
                  <ImageSelector
                    size="sm"
                    value={images[1]}
                    onChange={(value) => {
                      handleImageChange(1, value);
                    }}
                  />
                ) : (
                  <ImageSelector
                    size="sm"
                    value={undefined}
                    onChange={(value) => {
                      handleImageChange(1, value);
                    }}
                  />
                )}
                {images[2] ? (
                  <ImageSelector
                    size="sm"
                    value={images[2]}
                    onChange={(value) => {
                      handleImageChange(2, value);
                    }}
                  />
                ) : (
                  <ImageSelector
                    size="sm"
                    value={undefined}
                    onChange={(value) => {
                      handleImageChange(2, value);
                    }}
                  />
                )}
              </View>
            </View>
          </View>
          {!visible && (
            <Animated.View
              style={[
                height < guideHeight
                  ? styles.infoWrapper
                  : styles.infoOverlayWrapper,
                { marginTop: 40, opacity: animation, zIndex: 1000 },
              ]}
            >
              <RNText style={styles.infoTitle}>
                {t("features.mypage.eyes_nose_mouth_required")}
              </RNText>
              <RNText style={styles.infoDescription}>
                {t("features.mypage.eyes_nose_mouth_any_angle")}
              </RNText>
              <RNText style={styles.infoDescription}>{t("features.mypage.any_angle_ok")}</RNText>
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
          <Layout.TwoButtons
            disabledNext={isSubmitting}
            content={{
              next: isSubmitting ? t("features.mypage.saving") : t("features.mypage.save"),
            }}
            onClickNext={handleSubmit}
            onClickPrevious={onCloseModal}
          />
        </View>
      </View>
    </DefaultLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 28,
  },
  descriptioncontianer: {
    paddingTop: 16,
    paddingBottom: 64,
    paddingHorizontal: 28,
  },
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
  infoContainer: {
    position: "relative",
    flex: 1,

    left: "50%",
    transform: [{ translateX: "-50%" }],
    maxWidth: 468,
  },
  infoWrapper: {
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: "#F2ECFF",
    borderWidth: 1,
    borderColor: "#FFF",
    marginBottom: 230,
    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // Android에서 그림자
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,

    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: "#fff",
  },
  infoTitle: {
    color: "#9F84D8",
    fontWeight: 600,
    fontFamily: "semibold",
    lineHeight: 16.8,
    fontSize: 14,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 11,
    lineHeight: 13.2,
    color: "#BAB0D0",
  },
});

export default ChangeProfileImageModal;
