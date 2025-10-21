import { commonHandlers } from "@/src/shared/services/common-error-handler";

import { Text } from "react-native";
import type { ErrorHandler } from "../../../types/error-handler";

const handleDuplication: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const errorMessage = error.message!;
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

const handleNotFound: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    const errorMessage = error.message;
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

export const rouletteSpinErrorHandlers: Record<number | string, ErrorHandler> =
  {
    ...commonHandlers,
    400: handleDuplication,

    404: handleNotFound,
  };
