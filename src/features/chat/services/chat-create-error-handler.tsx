import type { ModalOptions } from "@/src/shared/providers/modal-provider";
import { commonHandlers } from "@/src/shared/services/common-error-handler";
import type { AxiosError } from "axios";
import type { useRouter } from "expo-router";
import { Text } from "react-native";
import type { ErrorHandler } from "../../../types/error-handler";

const handleConflict: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    const errorMessage =
      error.error || error.message || "이미 상대방과 채팅방이 개설되었습니다.";
    showModal({
      title: "알림",
      children: <Text>{errorMessage}</Text>,
      primaryButton: {
        text: "채팅 목록으로",
        onClick: () => router.push("/chat"),
      },
    });
  },
};

const handleFobbiden: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    const errorMessage =
      error.error || error.message || "문제가 발생하였습니다.";
    showModal({
      title: "알림",
      children: <Text>{errorMessage}</Text>,
      primaryButton: {
        text: "확인",
        onClick: () => {},
      },
    });
  },
};

export const errorHandlers: Record<number | string, ErrorHandler> = {
  ...commonHandlers,
  403: handleFobbiden,
  409: handleConflict,
};
