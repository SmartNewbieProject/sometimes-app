import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import apis from "@/src/features/mypage/apis";

import Layout from "@/src/features/layout";
import { DefaultLayout } from "@/src/features/layout/ui";
import { useModal } from "@/src/shared/hooks/use-modal";
import {
  GuideView,
  guideHeight,
  useOverlay,
} from "@/src/shared/hooks/use-overlay";
import { cn } from "@/src/shared/libs";

import { ImageSelector, Text } from "@/src/shared/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Text as RNText,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
  const router = useRouter();
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
      </View>
    );
  }, []);



  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
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

      await apis.uploadProfileImages(validImages);

      await queryClient.invalidateQueries({ queryKey: ["my-profile-details"] });
      await queryClient.invalidateQueries({ queryKey: ["profile-image-review-status"] });
      hideModal();

      setTimeout(() => {
        router.push("/my/approval-step/waiting");
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
          <View style={[styles.container, { paddingTop: insets.top }]}>
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
                {t('features.mypage.profile_image_change.title')}
              </Text>
              <Text weight="semibold" size="20" textColor="black">
                {t('features.mypage.profile_image_change.subtitle')}
              </Text>
            </View>

            <View style={styles.descriptioncontianer}>
              <Text weight="medium" size="sm" textColor="pale-purple">
                {t('features.mypage.profile_image_change.guide')}
              </Text>
              <Text weight="medium" size="sm" textColor="pale-purple">
                {t("apps.auth.sign_up.profile_image.guide_2")}
              </Text>
            </View>

            <View className="flex-row justify-center px-[8px]  w-full gap-[16px]">
              <View className="flex  justify-center items-center">
                {images[0] ? (
                  <ImageSelector
                    size="lg"
                    actionLabel={t("features.mypage.image-modal.main")}
                    value={images[0]}
                    onChange={(value) => {
                      handleImageChange(0, value);
                    }}
                  />
                ) : (
                  <ImageSelector
                    size="lg"
                    actionLabel={t("features.mypage.image-modal.main")}
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
                {t("apps.auth.sign_up.profile_image.info_title")}
              </RNText>
              <RNText style={styles.infoDescription}>
                {t("apps.auth.sign_up.profile_image.info_desc_1")}
              </RNText>
              <RNText style={styles.infoDescription}> {t("apps.auth.sign_up.profile_image.info_desc_2")}</RNText>
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
            disabledNext={isSubmitting || images.filter((img) => img !== null).length !== 3}
            content={{
              next: isSubmitting ? t("features.mypage.image-modal.saving") : t("features.mypage.image-modal.save"),
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
    backgroundColor: semanticColors.surface.secondary,
    borderWidth: 1,
    borderColor: semanticColors.border.default,

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
    marginLeft: -234, // 468 / 2 = 234 (maxWidth의 절반)
    maxWidth: 468,
  },
  infoWrapper: {
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
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
    backgroundColor: semanticColors.surface.background,
  },
  infoTitle: {
    color: semanticColors.brand.accent,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16.8,
    fontSize: 14,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 11,
    lineHeight: 13.2,
    color: semanticColors.text.disabled,
  },
});

export default ChangeProfileImageModal;
