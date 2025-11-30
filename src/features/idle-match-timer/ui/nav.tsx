import { ImageResources } from "@/src/shared/libs";
import { semanticColors } from '@/src/shared/constants/colors';
import { Button, ImageResource , Text } from "@/src/shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import useILiked from "../../like/hooks/use-liked";
import { LikeButton } from "../../like/ui/like-button";
import { useRematch } from "../hooks";

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
  console.log("isdata", isLikedPartner(match?.connectionId ?? ""));
  const showPartnerFindAnnouncement = () => {
    showModal({
      showLogo: true,

      customTitle: (
        <View
          style={styles.titleContainer}
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
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            성격과 소통 스타일을 바탕으로,
          </Text>
          <Text style={styles.contentText}>
            자연스럽게 연결될 수 있는 인연을 추천해드릴게요.
          </Text>
        </View>
      ),
      primaryButton: {
        text: "네, 해볼래요",
        onClick: onRematch,
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
        variant={hasPartner ? "outline" : "primary"}
        flex="flex-1"
        prefix={
          <ImageResource resource={ImageResources.GEM} width={23} height={23} />
        }
      >
        <View style={styles.buttonContent}>
          {hasPartner && (
            <RNText style={styles.subText}>x{featureCosts?.REMATCHING}</RNText>
          )}
          <RNText
            style={[
              styles.buttonText,
              !hasPartner && styles.buttonTextPrimary
            ]}
          >
            더 찾아보기
          </RNText>
        </View>
      </Button>
      {isLiked ? (
        <Button
          onPress={() => {}}
          flex="flex-1"
          variant="secondary"
          styles={styles.disabledButton}
        >
          썸 보내기 완료!
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
  container: {
    flexDirection: "row",
    gap: 5,
    marginTop: 16,
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  contentContainer: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  contentText: {
    fontSize: 12,
    color: semanticColors.text.disabled,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: "300",
    paddingRight: 5,
    lineHeight: 18,
    color: semanticColors.brand.accent,
  },
  buttonText: {
    fontSize: 16,
    color: semanticColors.brand.primary,
  },
  buttonTextPrimary: {
    color: semanticColors.text.inverse,
  },
  disabledButton: {
    backgroundColor: semanticColors.surface.other,
  },
});