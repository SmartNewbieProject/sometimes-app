import { useModal } from "@/src/shared/hooks/use-modal";
import { Text } from "@/src/shared/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { createChatRoom } from "../apis";
import { errorHandlers } from "../services/chat-create-error-handler";
import { useKpiAnalytics } from "@/src/shared/hooks/use-kpi-analytics";

function useCreateChatRoom() {
  const router = useRouter();
  const { showModal, showErrorModal, hideModal } = useModal();
  const { chatEvents } = useKpiAnalytics();

  return useMutation({
    mutationFn: createChatRoom,
    onSuccess: ({ chatRoomId, partnerId }: { chatRoomId: string; partnerId?: string }) => {
      // KPI 이벤트: 채팅 시작
      if (partnerId) {
        chatEvents.trackChatStarted(partnerId, 'mutual_like');
      }

      router.push(`/chat/${chatRoomId}`);
    },
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onError: (error: any) => {
      console.error("채팅방 생성 실패:", error);
      hideModal();

      if (!error) {
        showErrorModal("네트워크 연결을 확인해주세요.", "announcement");
        return;
      }

      const status = error?.status ?? error?.statusCode;
      const handler = errorHandlers[status] || errorHandlers.default;

      handler.handle(error, { router, showModal, showErrorModal });
    },
  });
}

export default useCreateChatRoom;
