import { View } from "react-native";
import { MatchDetails } from "../types";
import { Button, ImageResource } from "@/src/shared/ui";
import { axiosClient, ImageResources, tryCatch } from "@/src/shared/libs";
import { useModal } from "@/src/shared/hooks/use-modal";
import { HttpStatusCode } from "axios";
import { Text } from '@shared/ui';
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/src/shared/config/query";
import { router } from "expo-router";
import { useMatchLoading } from "../hooks";
import Instagram from "../../instagram";

const { ui: { InstagramContactButton } } = Instagram;

type InteractionNavigationProps = {
  match: MatchDetails;
};

const useRematchingMutation = () =>
  useMutation({
    mutationFn: () => axiosClient.post('/matching/rematch'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latest-matching'] });
    },
  });

export const InteractionNavigation = ({ match }: InteractionNavigationProps) => {
  const hasPartner = !!match.partner;
  const { showErrorModal, showModal } = useModal();
  const { mutateAsync: rematch } = useRematchingMutation();
  const { onLoading, finishLoading } = useMatchLoading();

  const showRematchSuccessModal = () => {
    showModal({
      title: "연인 찾기 완료",
      children: "연인을 찾았어요! 바로 확인해보세요.",
      primaryButton: {
        text: "바로 확인하기",
        onClick: finishLoading,
      },
    });
  };

  const showTicketPurchaseModal = () => {
    showModal({
      title: "연인 매칭권이 없어요",
      children: (
        <View className="flex flex-col">
          <Text>
            연인매칭권이 부족해 즉시 매칭을 수행할 수 없어요
          </Text>
          <Text>
            매칭권을 구매하시겠어요?
          </Text>
        </View>
      ),
      primaryButton: {
        text: "살펴보러가기",
        onClick: () => {
          finishLoading();
          router.navigate('/purchase/tickets/rematch')
        },
      },
      secondaryButton: {
        text: '다음에 볼게요',
        onClick: finishLoading,
      },
    });
  };

  const performRematch = async () => {
    await tryCatch(async () => {
      onLoading();
      await rematch();
      showRematchSuccessModal();
    }, err => {
      if (err.status === HttpStatusCode.Forbidden) {
        showTicketPurchaseModal();
        return;
      }
      finishLoading();
      showErrorModal(err.error, "error");
    });
  };

  const showRematchConfirmModal = () => {
    showModal({
      children: (
        <View className="w-full justify-center items-center">
          <Text textColor="black" size="md">
            재매칭권을 사용하시겠습니까?
          </Text>
        </View>
      ),
      primaryButton: {
        text: "사용하기",
        onClick: performRematch,
      },
    });
  };

  const onRematch = async () => {
    await tryCatch(async () => {
      showRematchConfirmModal();
    }, err => {
      finishLoading();
      if (err.status === HttpStatusCode.Forbidden) {
        showErrorModal("재매칭권이 없습니다.", "announcement");
        return;
      }
      showErrorModal(err.error, "error");
    });
  };

  return (
    <View className="w-full flex flex-row gap-x-2 mt-4">
      <Button
        onPress={onRematch}
        variant="primary"
        className="flex-1"
        prefix={<ImageResource resource={ImageResources.TICKET} width={32} height={32} />}
      >
        재매칭권 사용하기
      </Button>
      {hasPartner && (
        <InstagramContactButton instagramId={match.partner!.instagramId} />
      )}
    </View>
  )
};
