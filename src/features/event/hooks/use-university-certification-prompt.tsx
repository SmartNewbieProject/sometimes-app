import { useState, useEffect } from "react";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@/src/features/auth";
import { useFreeRewardStatus } from "@/src/features/free-reward";
import { getProfileId, getUniversityVerificationStatus } from "@/src/features/university-verification/apis";
import { storage } from "@/src/shared/libs";
import { useRouter } from "expo-router";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useTranslation } from "react-i18next";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

export const useUniversityCertificationPrompt = () => {
  const router = useRouter();
  const { my, isAuthorized } = useAuth();
  const { isRewardEligible, isSuccess: isFreeRewardLoaded } = useFreeRewardStatus();
  const { showModal } = useModal();
  const { t } = useTranslation();
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkUniversityCertificationStatus = async () => {
    if (!isAuthorized || !my) {
      setIsLoading(false);
      return;
    }

    // free-reward API에서 eligible=false이면 프롬프트 표시 안 함
    if (isFreeRewardLoaded && !isRewardEligible('universityVerification')) {
      setShouldShowPrompt(false);
      setIsLoading(false);
      return;
    }

    try {
      const hasDismissedPrompt = await storage.getItem(`university-certification-dismissed-${my.phoneNumber}`);
      if (hasDismissedPrompt === "true") {
        setShouldShowPrompt(false);
        setIsLoading(false);
        return;
      }

      const profileId = await getProfileId();
      const verificationStatus = await getUniversityVerificationStatus(profileId);

      if (verificationStatus.verifiedAt) {
        const verifiedYear = new Date(verificationStatus.verifiedAt).getFullYear();
        const currentYear = new Date().getFullYear();
        const isVerified = verifiedYear === currentYear;

        if (isVerified) {
          setShouldShowPrompt(false);
        } else {
          setShouldShowPrompt(true);
        }
      } else {
        setShouldShowPrompt(true);
      }
    } catch (error) {
      console.error("Failed to check university certification status:", error);
      const hasDismissedPrompt = await storage.getItem(`university-certification-dismissed-${my.phoneNumber}`);
      if (hasDismissedPrompt !== "true") {
        setShouldShowPrompt(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUniversityCertificationStatus();
  }, [isAuthorized, my, isFreeRewardLoaded]);

  useEffect(() => {
    if (!shouldShowPrompt) return;

    setShouldShowPrompt(false);

    const phoneNumber = my?.phoneNumber;

    showModal({
      showLogo: (
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/promotion/home-banner/gem.webp")}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>
      ),
      title: t('features.event.ui.university_certification_prompt.title'),
      children: (
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            {t('features.event.ui.university_certification_prompt.subtitle')}
          </Text>
          <View style={styles.rewardContainer}>
            <View style={styles.gemIconContainer}>
              <Image
                source={require("@/assets/images/promotion/home-banner/gem.webp")}
                style={styles.gemImage}
                contentFit="contain"
              />
            </View>
            <View>
              <Text style={styles.rewardText}>
                {t('features.event.ui.university_certification_prompt.benefit_text')}
              </Text>
              <Text style={styles.rewardSubtext}>
                {t('features.event.ui.university_certification_prompt.reward_subtext')}
              </Text>
            </View>
          </View>
        </View>
      ),
      primaryButton: {
        text: t('features.event.ui.university_certification_prompt.certify_button'),
        onClick: () => router.push("/university-verification"),
      },
      secondaryButton: {
        text: t('features.event.ui.university_certification_prompt.later_button'),
        onClick: async () => {
          if (phoneNumber) {
            await storage.setItem(`university-certification-dismissed-${phoneNumber}`, "true");
          }
        },
      },
    });
  }, [shouldShowPrompt]);

  const markPromptAsShown = async () => {
    if (!my?.phoneNumber) return;

    try {
      await storage.setItem(`university-certification-dismissed-${my.phoneNumber}`, "true");
      setShouldShowPrompt(false);
    } catch (error) {
      console.error("Failed to mark certification prompt as shown:", error);
    }
  };

  const renderPromptModal = () => null;

  return {
    shouldShowPrompt,
    isLoading,
    markPromptAsShown,
    renderPromptModal,
  };
};

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    color: semanticColors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: semanticColors.brand.primary,
  },
  gemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: semanticColors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gemImage: {
    width: 24,
    height: 24,
  },
  rewardText: {
    fontSize: 15,
    color: semanticColors.text.primary,
    fontFamily: 'Pretendard-Bold',
  },
  rewardSubtext: {
    fontSize: 12,
    color: semanticColors.brand.primary,
    fontFamily: 'Pretendard-SemiBold',
    marginTop: 2,
  },
  logoContainer: {
    padding: 5,
    borderRadius: 999,
    backgroundColor: semanticColors.brand.primary,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
});