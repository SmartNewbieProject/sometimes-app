import { commonHandlers } from "@/src/shared/services/common-error-handler";
import type { ErrorHandler } from "@/src/types/error-handler";
import { Text } from "react-native";

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

const handlerChatRoomNotFound: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    const errorMessage =
      error.response?.data?.message || "채팅방을 찾을 수 없습니다.";
    showModal({
      title: "권한 오류",
      children: <Text>{errorMessage}</Text>,
      primaryButton: {
        text: "확인",
        onClick: () => router.push("/chat"),
      },
    });
  },
};

export const chatLeaveErrorHandlers: Record<number | string, ErrorHandler> = {
  ...commonHandlers,
  403: handleChatRoomForbidden,
  404: handlerChatRoomNotFound,
};
