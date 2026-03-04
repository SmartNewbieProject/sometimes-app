import { useState, useEffect } from "react";
import { useAuth } from "@/src/features/auth";
import { useFreeRewardStatus } from "@/src/features/free-reward";
import { UniversityCertificationPromptModal } from "./ui/university-certification-prompt-modal";
import { getProfileId, getUniversityVerificationStatus } from "@/src/features/university-verification/apis";
import { storage } from "@/src/shared/libs";
import { useRouter } from "expo-router";

export const useUniversityCertificationPrompt = () => {
  const router = useRouter();
  const { my, isAuthorized } = useAuth();
  const { isRewardEligible, isSuccess: isFreeRewardLoaded } = useFreeRewardStatus();
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

  const handleCertify = () => {
    router.push("/university-verification");
  };

  const handleLater = async () => {
    if (my?.phoneNumber) {
      await storage.setItem(`university-certification-dismissed-${my.phoneNumber}`, "true");
    }
    setShouldShowPrompt(false);
  };

  const markPromptAsShown = async () => {
    if (!my?.phoneNumber) return;

    try {
      await storage.setItem(`university-certification-dismissed-${my.phoneNumber}`, "true");
      setShouldShowPrompt(false);
    } catch (error) {
      console.error("Failed to mark certification prompt as shown:", error);
    }
  };

  const renderPromptModal = () => (
    <UniversityCertificationPromptModal
      visible={shouldShowPrompt}
      onClose={() => setShouldShowPrompt(false)}
      onCertify={handleCertify}
      onLater={handleLater}
    />
  );

  return {
    shouldShowPrompt,
    isLoading,
    markPromptAsShown,
    renderPromptModal,
  };
};