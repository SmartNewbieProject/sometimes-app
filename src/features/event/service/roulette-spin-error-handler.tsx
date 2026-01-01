import { commonHandlers } from "@/src/shared/services/common-error-handler";
import i18n from "@/src/shared/libs/i18n";
import { Text } from "react-native";
import type { ErrorHandler } from "../../../types/error-handler";

const handleDuplication: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const errorMessage = error.message!;
    showModal({
      title: i18n.t("features.event.notification"),
      children: <Text>{errorMessage}</Text>,
      primaryButton: {
        text: i18n.t("confirm"),
        onClick: () => {},
      },
    });
  },
};

const handleNotFound: ErrorHandler = {
  handle: (error, { router, showModal }) => {
    const errorMessage = error.message;
    showModal({
      title: i18n.t("features.event.notification"),
      children: <Text>{errorMessage}</Text>,
      primaryButton: {
        text: i18n.t("confirm"),
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
