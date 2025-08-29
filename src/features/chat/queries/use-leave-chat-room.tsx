import { useModal } from "@/src/shared/hooks/use-modal";
import { Text } from "@/src/shared/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { leaveChatRoom } from "../apis";

function useLeaveChatRoom() {
  const router = useRouter();
  const { showErrorModal, showModal, hideModal } = useModal();
  return useMutation({
    mutationFn: leaveChatRoom,
    onSuccess: () => {
      showModal({
        title: "안내",
        children: <Text textColor="black">채팅방을 나갔습니다.</Text>,
        primaryButton: {
          text: "확인",
          onClick: () => {
            hideModal();
            router.push("/chat");
          },
        },
      });
    },
    onError: () => {
      showErrorModal(
        "채팅방 나가기에 실패하였습니다. 관리자에게 문의 바랍니다.",
        "announcement"
      );
    },
  });
}

export default useLeaveChatRoom;
