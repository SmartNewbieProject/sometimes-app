import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { storage, axiosClient } from "@/src/shared/libs";
import { useTranslation } from "react-i18next";

const checkWelcomeRewardStatus = async (): Promise<{ received: boolean }> => {
  return axiosClient.get("/profile/welcome-gems/status");
};

const receiveWelcomeReward = async () => {
  return axiosClient.post("/profile/welcome-gems/receive");
};

export const useWelcomeReward = () => {
  const { t } = useTranslation();
  const [shouldShowReward, setShouldShowReward] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { my, isAuthorized } = useAuth();

  useEffect(() => {
    const checkRewardStatus = async () => {
      if (!isAuthorized || !my) {
        setIsLoading(false);
        return;
      }

      try {
        const localStatus = await storage.getItem(`welcome-reward-${my.phoneNumber}`);

        if (localStatus === "true") {
          setShouldShowReward(false);
          setIsLoading(false);
          return;
        }

        const { received } = await checkWelcomeRewardStatus();

        if (received) {
          await storage.setItem(`welcome-reward-${my.phoneNumber}`, "true");
          setShouldShowReward(false);
        } else if (my.gender === "FEMALE") {
          setShouldShowReward(true);
        }
      } catch (error) {
        console.error(t("features.welcome-reward.ui.modal.status_check_error"), error);
        const localStatus = await storage.getItem(`welcome-reward-${my.phoneNumber}`);
        if (my.gender === "FEMALE" && localStatus !== "true") {
          setShouldShowReward(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkRewardStatus();
  }, [isAuthorized, my]);

  const markRewardAsReceived = async () => {
    if (!my?.phoneNumber) {
      console.warn("markRewardAsReceived called without valid user data");
      return;
    }

    const phoneNumber = my.phoneNumber;

    try {
      await receiveWelcomeReward();
      await storage.setItem(`welcome-reward-${phoneNumber}`, "true");
      setShouldShowReward(false);
    } catch (error) {
      console.error(t("features.welcome-reward.ui.modal.receive_error"), error);
      await storage.setItem(`welcome-reward-${phoneNumber}`, "true");
      setShouldShowReward(false);
    }
  };

  return {
    shouldShowReward,
    isLoading,
    markRewardAsReceived,
  };
};