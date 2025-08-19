import { ImageResources, cn } from "@/src/shared/libs";
import { Button, ImageResource } from "@/src/shared/ui";
import { Text } from "@shared/ui";
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
        <View className="flex flex-col w-full items-center mt-[8px]">
          <Text className="text-[#AEAEAE] text-[12px]">
            성격과 소통 스타일을 바탕으로,
          </Text>
          <Text className="text-[#AEAEAE] text-[12px]">
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
    <View className="w-fulsl flex flex-row gap-x-[5px] mt-4">
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
            더 찾아보기
          </RNText>
        </View>
      </Button>
      {isLiked ? (
        <Button
          onPress={() => {}}
          className="flex-1 items-center !bg-[#E1D9FF] !text-white"
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
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: "300",
    paddingRight: 5,
    lineHeight: 18,
    color: "#BEACFF",
  },
});

export default MockInteractionNavigation;
