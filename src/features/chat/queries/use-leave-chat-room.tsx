import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { leaveChatRoom } from "../apis";

function useLeaveChatRoom() {
  const router = useRouter();
  const { showErrorModal } = useModal();
  return useMutation({
    mutationFn: leaveChatRoom,
    onSuccess: () => {
      router.push("/chat");
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
