import { ImageResources } from "@shared/libs";
import { AnnounceCard } from "@shared/ui";
import { onRedirectWallaForm } from "../libs";
import { semanticColors } from "@/src/shared/constants/colors";

type WallaFeedbackBannerProps = {
  textContent?: string;
};

export const WallaFeedbackBanner = ({
  textContent,
}: WallaFeedbackBannerProps) => (
  <AnnounceCard
    emoji={ImageResources.PAPER_PLANE_WITHOUT_BG}
    textSize={"12"}
    text={
      textContent || "여러분의 소중한 의견이 썸타임을 더 특별하게 만듭니다!"
    }
    customTextStyle={{
      color: semanticColors.brand.deep, // RGB(73, 56, 110) - 어두운 보라색
    }}
    onPress={onRedirectWallaForm}
  />
);
