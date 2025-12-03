import { ImageResources } from "@shared/libs";
import { AnnounceCard } from "@shared/ui";
import { useTranslation } from "react-i18next";
import { onRedirectWallaForm } from "../libs";

type WallaFeedbackBannerProps = {
  textContent?: string;
};

export const WallaFeedbackBanner = ({
  textContent,
}: WallaFeedbackBannerProps) => {
  const { t } = useTranslation();

  return (
    <AnnounceCard
      emoji={ImageResources.PAPER_PLANE_WITHOUT_BG}
      textSize={"12"}
      text={
        textContent || t("features.feedback.ui.index.feedback_banner_text")
      }
      onPress={onRedirectWallaForm}
    />
  );
};