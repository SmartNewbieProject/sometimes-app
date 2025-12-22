import { useState, useEffect } from "react";
import { useAuth } from "@/src/features/auth";
import { useModal } from "@/src/shared/hooks/use-modal";
import { CommunityEventPromptModal } from "./ui/community-event-prompt-modal";
import { getEventByType } from "../api";
import { EventType } from "../types";
import { storage } from "@/src/shared/libs";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

const COMMUNITY_GEMS_AMOUNT = 7;

export const useCommunityEvent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { my, isAuthorized } = useAuth();
  const { showModal } = useModal();
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkCommunityEventStatus = async () => {
    if (!isAuthorized || !my) {
      setIsLoading(false);
      return;
    }

    try {
      const hasWrittenPost = await storage.getItem(`community-written-post-${my.phoneNumber}`);
      const hasDismissed = await storage.getItem(`community-prompt-dismissed-${my.phoneNumber}`);

      if (hasWrittenPost === "true" || hasDismissed === "true") {
        setShouldShowPrompt(false);
        setIsLoading(false);
        return;
      }

      const eventDetails = await getEventByType(EventType.COMMUNITY_FIRST_POST);

      if (eventDetails.currentAttempt > 0) {
        await storage.setItem(`community-written-post-${my.phoneNumber}`, "true");
        setShouldShowPrompt(false);
      } else {
        setShouldShowPrompt(true);
      }
    } catch (error) {
      console.error("Failed to check community post status:", error);
      setShouldShowPrompt(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCommunityEventStatus();
  }, [isAuthorized, my]);

  const markRewardAsReceived = async () => {
    if (!my?.phoneNumber) return;

    try {
      await storage.setItem(`community-written-post-${my.phoneNumber}`, "true");
      setShouldShowPrompt(false);
    } catch (error) {
      console.error("Failed to mark post as written:", error);
    }
  };

  const handleWriteArticle = () => {
    router.push("/community/write");
  };

  const handleLater = async () => {
    try {
      if (my?.phoneNumber) {
        await storage.setItem(`community-prompt-dismissed-${my.phoneNumber}`, "true");
      }
      setShouldShowPrompt(false);
    } catch (error) {
      console.error("Failed to save dismissal state:", error);
      setShouldShowPrompt(false);
    }
  };

  const renderPromptModal = () => (
    <CommunityEventPromptModal
      visible={shouldShowPrompt}
      onClose={() => setShouldShowPrompt(false)}
      onWriteArticle={handleWriteArticle}
      onLater={handleLater}
    />
  );

  return {
    shouldShowPrompt,
    isLoading,
    markRewardAsReceived,
    renderPromptModal,
  };
};