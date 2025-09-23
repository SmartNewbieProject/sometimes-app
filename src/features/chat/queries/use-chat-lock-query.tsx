import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { enterChatRoom } from "../apis";
import { chatEnterErrorHandlers } from "../services/chat-enter-error-handler";

function useChatRockQuery(chatRoomId: string) {
  const router = useRouter();
  const { showModal, showErrorModal } = useModal();
  return useMutation({
    mutationFn: () => enterChatRoom({ chatRoomId }),
    onSuccess: ({ paymentConfirm }: { paymentConfirm: boolean }) => {
      router.push(`/chat/${chatRoomId}`);
    },
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onError: (error: any) => {
      console.error("채팅방 결제 실패:", error);

      if (!error) {
        showErrorModal("네트워크 연결을 확인해주세요.", "announcement");
        return;
      }

      const status = error.status;
      const handler =
        chatEnterErrorHandlers[status] || chatEnterErrorHandlers.default;

      handler.handle(error, { router, showModal, showErrorModal });
    },
  });
}

export default useChatRockQuery;
