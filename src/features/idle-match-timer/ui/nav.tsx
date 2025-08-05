import { ImageResources } from "@/src/shared/libs";
import { Button, ImageResource } from "@/src/shared/ui";
import {View} from "react-native";
import type { MatchDetails } from "../types";
import { Text } from '@shared/ui';

import Instagram from "../../instagram";
import useRematch from "../hooks/use-rematch";
import {useModal} from "@hooks/use-modal";
import {useFeatureCost} from "@features/payment/hooks";

const {
  ui: { InstagramContactButton },
} = Instagram;

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

  const showPartnerFindAnnouncement = () => {
    showModal({
      customTitle: (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Text textColor="black" weight="bold" size="20">
              마음에 드는 이성에게
            </Text>
              <Text textColor="black" weight="bold" size="20">
              구슬 {featureCosts?.OLD_REMATCHING}개로 관심을 표현할까요?
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
        text: '네, 해볼래요',
        onClick: onRematch,
      },
      secondaryButton: {
        text: '아니요',
        onClick: hideModal
      }
    })
  };

  return (
    <View className="w-full flex flex-row gap-x-[5px] mt-4">
      <Button
        onPress={showPartnerFindAnnouncement}
        variant="primary"
        className="flex-1 items-center"
        prefix={
          <ImageResource
            resource={ImageResources.WHITE_HEART}
            width={24}
            height={24}
          />
        }
      >
        더 찾아보기
      </Button>
      {hasPartner && (
        <InstagramContactButton
          instagramId={match?.partner?.instagramId as string}
        />
      )}
    </View>
  );
};
