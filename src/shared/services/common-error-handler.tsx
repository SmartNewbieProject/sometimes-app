import type { ErrorHandler } from "@/src/types/error-handler";
import { Text } from "react-native";

const handleBadRequest: ErrorHandler = {
  handle: (error, { showModal }) => {
    const errorMessage = error.response?.data?.message || "잘못된 요청입니다.";
    showModal({
      title: "알림",
      children: <Text>{errorMessage}</Text>,
      primaryButton: { text: "확인", onClick: () => {} },
    });
  },
};

const handleUnauthorized: ErrorHandler = {
  handle: (_, { router, showModal }) => {
    showModal({
      title: "인증 오류",
      children: <Text>로그인이 필요하거나 접근 권한이 없습니다.</Text>,
      primaryButton: {
        text: "로그인 페이지로",
        onClick: () => router.push("/auth/login"),
      },
    });
  },
};

const handleDefault: ErrorHandler = {
  handle: (_, { showErrorModal }) => {
    showErrorModal(
      "서버에 문제가 발생했습니다. 관리자에게 문의 바랍니다.",
      "announcement"
    );
  },
};

export const commonHandlers = {
  400: handleBadRequest,
  404: handleBadRequest,
  401: handleUnauthorized,
  default: handleDefault,
};
