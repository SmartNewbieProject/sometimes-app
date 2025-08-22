import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { storage, axiosClient } from "@/src/shared/libs";

const checkWelcomeRewardStatus = async (): Promise<{ received: boolean }> => {
  return axiosClient.get("/profile/welcome-gems/status");
};

const receiveWelcomeReward = async () => {
  return axiosClient.post("/profile/welcome-gems/receive");
};

export const useWelcomeReward = () => {
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
        console.error("환영 보상 상태 확인 오류:", error);
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
    if (!my?.phoneNumber) return;

    try {
      await receiveWelcomeReward();
      await storage.setItem(`welcome-reward-${my.phoneNumber}`, "true");
      setShouldShowReward(false);
    } catch (error) {
      console.error("환영 보상 수령 오류:", error);
      await storage.setItem(`welcome-reward-${my.phoneNumber}`, "true");
      setShouldShowReward(false);
    }
  };

  return {
    shouldShowReward,
    isLoading,
    markRewardAsReceived,
  };
};
