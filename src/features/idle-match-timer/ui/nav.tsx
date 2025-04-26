import { View } from "react-native";
import { MatchDetails } from "../types";
import { Button, ImageResource } from "@/src/shared/ui";
import { axiosClient, ImageResources, tryCatch } from "@/src/shared/libs";
import { useModal } from "@/src/shared/hooks/use-modal";
import { HttpStatusCode } from "axios";
import { Text } from '@shared/ui';
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/src/shared/config/query";

type InteractionNavigationProps = {
  match: MatchDetails;
  setRematching: (value: boolean) => void;
};

const useRematchingMutation = () =>
  useMutation({
    mutationFn: () => axiosClient.post('/matching/rematch'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latest-matching'] });
    },
  });

export const InteractionNavigation = ({ match, setRematching }: InteractionNavigationProps) => {
  const hasPartner = !!match.partner;
  const { showErrorModal, showModal } = useModal();
  const { mutateAsync: rematch } = useRematchingMutation();

  const onRematch = async () => {
    setRematching(true);
    await tryCatch(async () => {
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
          onClick: async () => {
            await rematch();
            showModal({
              title: "연인 찾기 완료",
              children: "연인을 찾았어요! 바로 확인해보세요.",
            });
          },
        },
      });
    }, err => {
      if (err.status === HttpStatusCode.Forbidden) {
        showErrorModal("재매칭권이 없습니다.", "announcement");
        return;
      }
      showErrorModal(err.error, "error");
    });
    setRematching(false);
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
        <Button
          variant="secondary"
          className="flex-1"
        >
          연락하기
        </Button>
      )}
    </View>
  )
};
