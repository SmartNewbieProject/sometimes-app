import { ImageResources, cn } from "@/src/shared/libs";
import { semanticColors } from '../../../shared/constants/colors';
import { Button, ImageResource , Text } from "@/src/shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import { useTranslation } from "react-i18next";
import useILiked from "../../like/hooks/use-liked";
import { LikeButton } from "../../like/ui/like-button";
import useRematch from "../hooks/use-rematch";


type InteractionNavigationProps = {
  match?: MatchDetails;
};

export const InteractionNavigation = ({
  match,
}: InteractionNavigationProps) => {
  const hasPartner = !!match?.partner;
  const { onRematch } = useRematch();
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const { isLikedPartner } = useILiked();
  const isLiked = isLikedPartner(match?.connectionId ?? "");
  const { t } = useTranslation();
  console.log("isdata", isLikedPartner(match?.connectionId ?? ""));
  const showPartnerFindAnnouncement = () => {
    showModal({
      showLogo: true,

      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text textColor="black" weight="bold" size="20">
            {t("features.idle-match-timer.ui.nav.modal_title_1")}
          </Text>
          <Text textColor="black" weight="bold" size="20">
            {t("features.idle-match-timer.ui.nav.modal_title_2", {
              count: featureCosts?.REMATCHING,
            })}
          </Text>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[8px]">
          <Text className="text-text-disabled text-[12px]">
            {t("features.idle-match-timer.ui.nav.modal_text_1")}
          </Text>
          <Text className="text-text-disabled text-[12px]">
            {t("features.idle-match-timer.ui.nav.modal_text_2")}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("features.idle-match-timer.ui.nav.primary_button"),
        onClick: onRematch,
      },
      secondaryButton: {
        text: t("global.no"),
        onClick: hideModal,
      },
    });
  };

  return (
    <View className=" flex flex-row gap-x-[5px] mt-4">
      <Button
        onPress={showPartnerFindAnnouncement}
        variant={hasPartner ? "outline" : "primary"}
        className="flex-1 items-center"
        prefix={
          <ImageResource resource={ImageResources.GEM} width={23} height={23} />
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {hasPartner && (
            <RNText style={styles.subText}>x{featureCosts?.REMATCHING}</RNText>
          )}
          <RNText
            className={cn(
              "text-md text-primaryPurple whitespace-nowrap",
              !hasPartner && "text-text-inverse"
            )}
          >
            {t("features.idle-match-timer.ui.nav.main_button")}
          </RNText>
        </View>
      </Button>
      {isLiked ? (
        <Button
          onPress={() => {}}
          className="flex-1 items-center !bg-surface-other !text-text-inverse"
        >
          {t("features.idle-match-timer.ui.nav.complete_button")}
        </Button>
      ) : hasPartner ? (
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        <LikeButton connectionId={match.connectionId!} />
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  subText: {
    fontSize: 15,
    fontFamily: "thin",
    fontWeight: "300",
    paddingRight: 5,
    lineHeight: 18,
    color: semanticColors.brand.accent,
  },
});