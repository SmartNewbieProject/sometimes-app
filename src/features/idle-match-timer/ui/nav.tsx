import { ImageResources, cn } from "@/src/shared/libs";
import { semanticColors } from '../../../shared/constants/colors';
import { Button, ImageResource } from "@/src/shared/ui";
import { Text } from "@shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
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
            마음에 드는 이성을 찾기위해
          </Text>
          <Text textColor="black" weight="bold" size="20">
            구슬 {featureCosts?.REMATCHING}개를 사용할게요!
          </Text>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[8px]">
          <Text className="text-text-disabled text-[12px]">
            성격과 소통 스타일을 바탕으로,
          </Text>
          <Text className="text-text-disabled text-[12px]">
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
            더 찾아보기
          </RNText>
        </View>
      </Button>
      {isLiked ? (
        <Button
          onPress={() => {}}
          className="flex-1 items-center !bg-surface-background !text-text-inverse"
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
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: "300",
    paddingRight: 5,
    lineHeight: 18,
    color: semanticColors.brand.accent,
  },
});
