import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { createChatRoom } from "../apis";

function useCreateChatRoom() {
  const router = useRouter();
  const { showErrorModal } = useModal();
  return useMutation({
    mutationFn: createChatRoom,
    onSuccess: ({ chatRoomId }: { chatRoomId: string }) => {
      router.push(`/chat/${chatRoomId}`);
    },
    onError: () => {
      showErrorModal(
        "채팅방 생성에 실패하였습니다. 관리자에게 문의 바랍니다.",
        "announcement"
      );
    },
  });
}

export default useCreateChatRoom;
