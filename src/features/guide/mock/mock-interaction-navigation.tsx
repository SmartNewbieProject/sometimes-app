import { ImageResources } from "@/src/shared/libs";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Button, ImageResource , Text } from "@/src/shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../../idle-match-timer/types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useILiked from "../../like/hooks/use-liked";
import { LikeButton } from "../../like/ui/like-button";
import MockLikeButton from "./mock-like-button";


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
        <View style={styles.modalContent}>
          <Text textColor="disabled" style={styles.modalText}>
            {t("features.guide.mock.mock_interaction_navigation.modal_text_1")}
          </Text>
          <Text textColor="disabled" style={styles.modalText}>
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
    <View style={styles.container}>
      <Button
        onPress={showPartnerFindAnnouncement}
        variant={"outline"}
        style={styles.buttonBase}
        prefix={
          <ImageResource resource={ImageResources.GEM} width={23} height={23} />
        }
      >
        <View style={styles.buttonContent}>
          <RNText style={styles.subText}>x{featureCosts?.REMATCHING}</RNText>
          <RNText style={styles.mainButtonText}>
            {t("features.guide.mock.mock_interaction_navigation.main_button")}
          </RNText>
        </View>
      </Button>
      {isLiked ? (
        <Button
          onPress={() => {}}
          style={styles.completedButton}
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
  container: {
    flexDirection: "row",
    gap: 5,
    marginTop: 16,
  },
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: "300",
    paddingRight: 5,
    lineHeight: 18,
    color: semanticColors.brand.accent,
  },
  modalContent: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  modalText: {
    fontSize: 12,
  },
  buttonBase: {
    flex: 1,
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainButtonText: {
    fontSize: 14,
    color: "#8B5CF6",
  },
  completedButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: semanticColors.surface.background,
  },
});

export default MockInteractionNavigation;