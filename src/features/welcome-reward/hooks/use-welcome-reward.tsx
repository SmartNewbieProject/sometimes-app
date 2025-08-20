import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { storage } from "@/src/shared/libs";

export const useWelcomeReward = () => {
  const [shouldShowReward, setShouldShowReward] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { my, isAuthorized } = useAuth();

  useEffect(() => {
    const checkWelcomeRewardStatus = async () => {
      if (!isAuthorized || !my) {
        setIsLoading(false);
        return;
      }

      try {
        const hasReceivedReward = await storage.getItem(`welcome-reward-${my.phoneNumber}`);
        
        if (my.gender === "FEMALE" && !hasReceivedReward) {
          setShouldShowReward(true);
        }
      } catch (error) {
        console.error("환영 보상 상태 확인 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWelcomeRewardStatus();
  }, [isAuthorized, my]);

  const markRewardAsReceived = async () => {
    if (my?.phoneNumber) {
      try {
        await storage.setItem(`welcome-reward-${my.phoneNumber}`, "true");
        setShouldShowReward(false);
      } catch (error) {
        console.error("환영 보상 상태 저장 오류:", error);
      }
    }
  };

  return {
    shouldShowReward,
    isLoading,
    markRewardAsReceived,
  };
};
