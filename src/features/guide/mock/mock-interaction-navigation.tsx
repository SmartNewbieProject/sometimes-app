import { ImageResources } from "@/src/shared/libs";
import { semanticColors } from '../../../shared/constants/colors';
import { Button, ImageResource , Text } from "@/src/shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../../idle-match-timer/types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import { useState } from "react";
import useILiked from "../../like/hooks/use-liked";
import { LikeButton } from "../../like/ui/like-button";
import MockLikeButton from "./mock-like-button";

const MockInteractionNavigation = () => {
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const [isLiked, setLiked] = useState(false);
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
            마음에 드는 이성을 찾기위해
          </Text>
          <Text textColor="black" weight="bold" size="20">
            구슬 {featureCosts?.REMATCHING}개를 사용할게요!
          </Text>
        </View>
      ),
      children: (
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            성격과 소통 스타일을 바탕으로,
          </Text>
          <Text style={styles.modalText}>
            자연스럽게 연결될 수 있는 인연을 추천해드릴게요.
          </Text>
        </View>
      ),
      primaryButton: {
        text: "네, 해볼래요",
        onClick: () => {
          setLiked(true);
        },
      },
      secondaryButton: {
        text: "아니요",
        onClick: hideModal,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={showPartnerFindAnnouncement}
        variant={"outline"}
        style={styles.findButton}
        prefix={
          <ImageResource resource={ImageResources.GEM} width={23} height={23} />
        }
      >
        <View style={styles.buttonContent}>
          <RNText style={styles.subText}>x{featureCosts?.REMATCHING}</RNText>
          <RNText style={styles.findButtonText}>
            더 찾아보기
          </RNText>
        </View>
      </Button>
      {isLiked ? (
        <Button
          onPress={() => {}}
          style={styles.completedButton}
        >
          썸 보내기 완료!
        </Button>
      ) : (
        <MockLikeButton />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 16,
  },
  modalContent: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  modalText: {
    fontSize: 12,
    color: semanticColors.text.disabled,
  },
  findButton: {
    flex: 1,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  findButtonText: {
    fontSize: 16,
    color: semanticColors.brand.primary,
    whiteSpace: 'nowrap',
  },
  completedButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: semanticColors.surface.background,
  },
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: "300",
    paddingRight: 5,
    lineHeight: 18,
    color: semanticColors.brand.accent,
  },
});

export default MockInteractionNavigation;
