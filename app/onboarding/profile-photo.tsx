import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import apis from "@/src/features/mypage/apis";
import { DefaultLayout } from "@/src/features/layout/ui";
import Layout from "@/src/features/layout";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ImageSelector, Text } from "@/src/shared/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text as RNText,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { PalePurpleGradient } from "@/src/shared/ui/gradient";

export default function OnboardingProfilePhotoPage() {
  const { showErrorModal } = useModal();
  const insets = useSafeAreaInsets();
  const { profileDetails } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();

  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const getErrorMessage = (error: any) => {
    return (
      error?.response?.data?.message ||
      error?.message ||
      error?.error ||
      t("features.mypage.unknown_error")
    );
  };

  const validImagesCount = images.filter((img) => img !== null).length;
  const canSubmit = validImagesCount >= 1;

  const handleSubmit = async () => {
    if (!profileDetails) {
      showErrorModal(t("features.mypage.profile_image_error_load"), "error");
      return;
    }

    const validImages = images.filter((img) => img !== null) as string[];
    if (validImages.length < 1) {
      showErrorModal(
        t("features.onboarding.profile_photo.min_one_required"),
        "announcement",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await apis.uploadProfileImages(validImages);

      await queryClient.invalidateQueries({ queryKey: ["my-profile-details"] });
      await queryClient.invalidateQueries({
        queryKey: ["profile-image-review-status"],
      });

      router.replace("/my/approval-step/waiting");
    } catch (error: any) {
      showErrorModal(
        `${t("features.mypage.profile_image_error_change")}${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profileDetails) {
    return (
      <DefaultLayout>
        <PalePurpleGradient />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A3EA1" />
          <Text style={styles.loadingText} textColor="black">
            {t("features.mypage.profile_image_loading")}
          </Text>
        </View>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout
      style={[styles.defaultLayout, Platform.OS === "web" && styles.webLayout]}
    >
      <PalePurpleGradient />
      <View style={{ flex: 1 }}>
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <View style={styles.titleContainer}>
            <Image
              source={require("@assets/images/profile-image.png")}
              style={{ width: 102, height: 102 }}
            />
            <Text
              weight="semibold"
              size="20"
              textColor="black"
              style={styles.titleText}
            >
              {t("features.onboarding.profile_photo.title")}
            </Text>
            <Text weight="semibold" size="20" textColor="black">
              {t("features.onboarding.profile_photo.subtitle")}
            </Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text weight="medium" size="sm" textColor="pale-purple">
              {t("features.onboarding.profile_photo.guide_1")}
            </Text>
            <Text weight="medium" size="sm" textColor="pale-purple">
              {t("features.onboarding.profile_photo.guide_2")}
            </Text>
          </View>
          <View style={styles.imageSelectorRow}>
            <View style={styles.mainImageContainer}>
              <ImageSelector
                size="lg"
                actionLabel={t("features.onboarding.profile_photo.required")}
                value={images[0] || undefined}
                onChange={(value) => handleImageChange(0, value)}
              />
            </View>

            <View style={styles.subImageColumn}>
              <ImageSelector
                size="sm"
                actionLabel={t("features.onboarding.profile_photo.recommended")}
                value={images[1] || undefined}
                onChange={(value) => handleImageChange(1, value)}
              />
              <ImageSelector
                size="sm"
                actionLabel={t("features.onboarding.profile_photo.recommended")}
                value={images[2] || undefined}
                onChange={(value) => handleImageChange(2, value)}
              />
            </View>
          </View>
          <View style={styles.infoWrapper}>
            <RNText style={styles.infoTitle}>
              {t("apps.auth.sign_up.profile_image.info_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("apps.auth.sign_up.profile_image.info_desc_1")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("apps.auth.sign_up.profile_image.info_desc_2")}
            </RNText>
            <Image
              source={require("@assets/images/instagram-some.webp")}
              style={styles.instagramSomeImage}
            />
            <Image
              source={require("@assets/images/instagram-lock.webp")}
              style={styles.instagramLockImage}
            />
          </View>
        </View>

        <View
          style={[
            styles.bottomContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <Layout.TwoButtons
            disabledNext={isSubmitting || !canSubmit}
            content={{
              next: isSubmitting
                ? t("features.onboarding.profile_photo.uploading")
                : t("features.onboarding.profile_photo.submit"),
              prev: t("features.onboarding.profile_photo.back"),
            }}
            onClickNext={handleSubmit}
            onClickPrevious={() => router.back()}
          />
        </View>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    textAlign: "center",
  },
  defaultLayout: {
    flex: 1,
  },
  webLayout: {
    maxWidth: 468,
    position: "relative",
    width: "100%",
    alignSelf: "center",
  },
  container: {
    flex: 1,
  },
  titleText: {
    marginTop: 8,
  },
  imageSelectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 8,
    width: "100%",
    gap: 16,
  },
  mainImageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  subImageColumn: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 12,
  },
  titleContainer: {
    paddingHorizontal: 28,
  },
  descriptionContainer: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  infoWrapper: {
    marginTop: 40,
    marginHorizontal: 28,
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
    elevation: 3,
  },
  bottomContainer: {
    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: semanticColors.surface.background,
  },
  infoTitle: {
    color: semanticColors.brand.accent,
    fontWeight: "600",
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
  instagramSomeImage: {
    width: 116,
    height: 175,
    position: "absolute",
    top: 20,
    right: -66,
  },
  instagramLockImage: {
    width: 52,
    height: 52,
    position: "absolute",
    top: -30,
    left: -30,
    transform: [{ rotate: "-10deg" }],
  },
});
