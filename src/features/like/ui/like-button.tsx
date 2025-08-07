import { ImageResources } from "@/src/shared/libs";
import { Button, ImageResource } from "@/src/shared/ui";
import { Text } from "@shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../../idle-match-timer/types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import useLike from "../hooks/use-like";

type LikeButtonProps = {
  match?: MatchDetails;
};

export const LikeButton = ({ match }: LikeButtonProps) => {
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const { onLike } = useLike();
  const showPartnerLikeAnnouncement = () => {
    if (!match?.connectionId) {
      return;
    }
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
            마음에 드는 이성에게
          </Text>
          <Text textColor="black" weight="bold" size="20">
            구슬 {featureCosts?.LIKE_MESSAGE}로 관심을 표현할까요?
          </Text>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center">
          <Text className="text-[#AEAEAE] text-[12px]">
            이성에게 간단히 관심을 표현하고,
          </Text>
          <Text className="text-[#AEAEAE] text-[12px]">
            그 다음 단계로 자연스럽게 나아가 보세요.
          </Text>
        </View>
      ),
      primaryButton: {
        text: "네, 해볼래요",
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        onClick: () => onLike(match?.connectionId!),
      },
      secondaryButton: {
        text: "아니요",
        onClick: hideModal,
      },
    });
  };

  return (
    <Button
      onPress={showPartnerLikeAnnouncement}
      variant="primary"
      className="flex-1 items-center"
      prefix={
        <ImageResource resource={ImageResources.GEM} width={23} height={23} />
      }
    >
      <RNText style={styles.subText}>x2</RNText>좋아요
    </Button>
  );
};

const styles = StyleSheet.create({
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 18,
    color: "#BEACFF",
    marginLeft: -6,
    marginRight: 5,
  },
});
