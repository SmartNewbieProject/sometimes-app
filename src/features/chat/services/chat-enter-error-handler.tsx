import { commonHandlers } from "@/src/shared/services/common-error-handler";

import { Text } from "react-native";
import type { ErrorHandler } from "../../../types/error-handler";

const handleAuth: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    const errorMessage = "인증에 실패하였습니다..";
    showModal({
      title: "알림",
      children: <Text>{errorMessage}</Text>,
      primaryButton: {
        text: "로그인",
        onClick: () => router.push("/auth/login"),
      },
    });
  },
};

const handlePayment: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    const errorMessage = "재화가 부족합니다";
    showModal({
      title: "알림",
      children: <Text>{errorMessage}</Text>,
      primaryButton: {
        text: "구매하러 가기",
        onClick: () => router.push("/purchase/gem-store"),
      },
      secondaryButton: {
        text: "취소",
        onClick: () => {},
      },
    });
  },
};

const handleNotFound: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    const errorMessage = "채팅방을 찾을 수 없습니다.";
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

export const chatEnterErrorHandlers: Record<number | string, ErrorHandler> = {
  ...commonHandlers,
  401: handleAuth,
  403: handlePayment,
  404: handleNotFound,
};
