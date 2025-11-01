import { ImageResources, cn } from "@/src/shared/libs";
import { Button, ImageResource } from "@/src/shared/ui";
import { Text } from "@shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../../idle-match-timer/types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useILiked from "../../like/hooks/use-liked";
import { LikeButton } from "../../like/ui/like-button";
import MockLikeButton from "./mock-like-button";
import { useAppFont } from "@/src/shared/hooks/use-app-font";

const MockInteractionNavigation = () => {
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const [isLiked, setLiked] = useState(false);
  const { t } = useTranslation();
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
            {t("features.guide.mock.mock_interaction_navigation.modal_title_1")}
          </Text>
          <Text textColor="black" weight="bold" size="20">
            {t("features.guide.mock.mock_interaction_navigation.modal_title_2", {
              count: featureCosts?.REMATCHING,
            })}
          </Text>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[8px]">
          <Text className="text-[#AEAEAE] text-[12px]">
            {t("features.guide.mock.mock_interaction_navigation.modal_text_1")}
          </Text>
          <Text className="text-[#AEAEAE] text-[12px]">
            {t("features.guide.mock.mock_interaction_navigation.modal_text_2")}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("features.guide.mock.mock_interaction_navigation.primary_button"),
        onClick: () => {
          setLiked(true);
        },
      },
      secondaryButton: {
        text: t("features.guide.mock.mock_interaction_navigation.secondary_button"),
        onClick: hideModal,
      },
    });
  };

  return (
    <View className=" flex flex-row gap-x-[5px] mt-4">
      <Button
        onPress={showPartnerFindAnnouncement}
        variant={"outline"}
        className="flex-1 items-center"
        prefix={
          <ImageResource resource={ImageResources.GEM} width={23} height={23} />
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <RNText style={styles.subText}>x{featureCosts?.REMATCHING}</RNText>
          <RNText
            className={cn("text-md text-primaryPurple whitespace-nowrap")}
          >
            {t("features.guide.mock.mock_interaction_navigation.main_button")}
          </RNText>
        </View>
      </Button>
      {isLiked ? (
        <Button
          onPress={() => {}}
          className="flex-1 items-center !bg-[#E1D9FF] !text-white"
        >
          {t("features.guide.mock.mock_interaction_navigation.complete_button")}
        </Button>
      ) : (
        <MockLikeButton />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  subText: {
    fontSize: 15,
    fontFamily: useAppFont("thin"),
    fontWeight: "300",
    paddingRight: 5,
    lineHeight: 18,
    color: "#BEACFF",
  },
});

export default MockInteractionNavigation;