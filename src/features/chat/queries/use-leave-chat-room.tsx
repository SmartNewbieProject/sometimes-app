import { useModal } from "@/src/shared/hooks/use-modal";
import { Text } from "@/src/shared/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { leaveChatRoom } from "../apis";
import { chatLeaveErrorHandlers } from "../services/chat-leave-error-handler";

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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onError: (error: any) => {
      console.error("채팅방 생성 실패:", error);

      if (!error) {
        showErrorModal("네트워크 연결을 확인해주세요.", "announcement");
        return;
      }

      const status = error.status;
      const handler =
        chatLeaveErrorHandlers[status] || chatLeaveErrorHandlers.default;

      handler.handle(error, { router, showModal, showErrorModal });
    },
  });
}

export default useLeaveChatRoom;
