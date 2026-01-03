import React from "react";
import { useTranslation } from "react-i18next";
import { CharacterPromptModal } from "@/src/shared/ui";

interface CommunityEventPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onWriteArticle: () => void;
  onLater: () => void;
}

export const CommunityEventPromptModal: React.FC<CommunityEventPromptModalProps> = ({
  visible,
  onClose,
  onWriteArticle,
  onLater,
}) => {
  const { t } = useTranslation();

  return (
    <CharacterPromptModal
      visible={visible}
      onClose={onClose}
      title={t("features.event.ui.community_event_prompt.title")}
      subtitle={t("features.event.ui.community_event_prompt.subtitle")}
      rewardText={t("features.event.ui.community_event_prompt.gem_label")}
      rewardSubtext={t("features.event.ui.community_event_prompt.reward_subtext")}
      primaryButtonText={t("features.event.ui.community_event_prompt.write_button")}
      secondaryButtonText={t("features.event.ui.community_event_prompt.later_button")}
      onPrimary={onWriteArticle}
      onSecondary={onLater}
    />
  );
};