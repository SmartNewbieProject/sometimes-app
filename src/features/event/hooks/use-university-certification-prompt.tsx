import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "@/src/features/auth";
import { useFreeRewardStatus } from "@/src/features/free-reward";
import { getProfileId, getUniversityVerificationStatus } from "@/src/features/university-verification/apis";
import { storage } from "@/src/shared/libs";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { CharacterPromptModal } from "@/src/shared/ui/character-prompt-modal";

export const useUniversityCertificationPrompt = () => {
  const router = useRouter();
  const { my, isAuthorized } = useAuth();
  const { isRewardEligible, isSuccess: isFreeRewardLoaded } = useFreeRewardStatus();
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkUniversityCertificationStatus = async () => {
    if (!isAuthorized || !my) {
      setIsLoading(false);
      return;
    }

    // free-reward API에서 eligible=false이면 프롬프트 표시 안 함
    if (isFreeRewardLoaded && !isRewardEligible('universityVerification')) {
      setIsModalVisible(false);
      setIsLoading(false);
      return;
    }

    try {
      const hasDismissedPrompt = await storage.getItem(`university-certification-dismissed-${my.phoneNumber}`);
      if (hasDismissedPrompt === "true") {
        setIsModalVisible(false);
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
          setIsModalVisible(false);
        } else {
          setIsModalVisible(true);
        }
      } else {
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error("Failed to check university certification status:", error);
      const hasDismissedPrompt = await storage.getItem(`university-certification-dismissed-${my.phoneNumber}`);
      if (hasDismissedPrompt !== "true") {
        setIsModalVisible(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUniversityCertificationStatus();
  }, [isAuthorized, my, isFreeRewardLoaded]);

  const markPromptAsShown = async () => {
    if (!my?.phoneNumber) return;

    try {
      await storage.setItem(`university-certification-dismissed-${my.phoneNumber}`, "true");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to mark certification prompt as shown:", error);
    }
  };

  const handleSecondary = async () => {
    if (my?.phoneNumber) {
      await storage.setItem(`university-certification-dismissed-${my.phoneNumber}`, "true");
    }
    setIsModalVisible(false);
  };

  const renderPromptModal = () => (
    <CharacterPromptModal
      visible={isModalVisible}
      onClose={() => setIsModalVisible(false)}
      title={t('features.event.ui.university_certification_prompt.title')}
      subtitle={t('features.event.ui.university_certification_prompt.subtitle')}
      rewardText={t('features.event.ui.university_certification_prompt.benefit_text')}
      rewardSubtext={t('features.event.ui.university_certification_prompt.reward_subtext')}
      primaryButtonText={t('features.event.ui.university_certification_prompt.certify_button')}
      secondaryButtonText={t('features.event.ui.university_certification_prompt.later_button')}
      onPrimary={() => router.push("/university-verification")}
      onSecondary={handleSecondary}
    />
  );

  return {
    shouldShowPrompt: isModalVisible,
    isLoading,
    markPromptAsShown,
    renderPromptModal,
  };
};

