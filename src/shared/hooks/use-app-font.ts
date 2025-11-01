import { useMemo } from "react";
import i18n from "@shared/libs/i18n";

export type FontWeight =
  | "thin"
  | "extralight"
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";

export const useAppFont = (weight: FontWeight = "regular") => {
  const locale = i18n.language
  const isJapanese = locale.startsWith("ja");

  const fontFamily = useMemo(() => {
    const prefix = isJapanese ? "MPLUS1p" : "Pretendard";
    switch (weight) {
      case "thin":
        return `${prefix}-Thin`;
      case "extralight":
        return `${prefix}-ExtraLight`;
      case "light":
        return `${prefix}-Light`;
      case "medium":
        return `${prefix}-Medium`;
      case "semibold":
        return `${prefix}-SemiBold`;
      case "bold":
        return `${prefix}-Bold`;
      case "extrabold":
        return `${prefix}-ExtraBold`;
      case "black":
        return `${prefix}-Black`;
      default:
        return `${prefix}-Regular`;
    }
  }, [isJapanese, weight]);

  return fontFamily;
};
