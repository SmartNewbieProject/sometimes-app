import { commonHandlers } from "@/src/shared/services/common-error-handler";
import type { ErrorHandler } from "@/src/types/error-handler";
import { Text } from "react-native";

const handleBadRequest: ErrorHandler = {
  handle: (error, { showModal }) => {
    const errorMessage = "잘못된 요청입니다.";
    showModal({
      title: "알림",
      children: <Text>{errorMessage}</Text>,
      primaryButton: { text: "확인", onClick: () => {} },
    });
  },
};

const handleChatRoomForbidden: ErrorHandler = {
  handle: (error, { showModal, router }) => {
    const errorMessage =
      error.response?.data?.message || "채팅방 접근 권한이 존재하지 않습니다.";
    showModal({
      title: "알림",
      children: <Text>{errorMessage}</Text>,
      primaryButton: { text: "확인", onClick: () => router.push("/chat") },
    });
  },
};

export const chatSnoozeErrorHandlers: Record<number | string, ErrorHandler> = {
  ...commonHandlers,
  400: handleBadRequest,
  403: handleChatRoomForbidden,
};
