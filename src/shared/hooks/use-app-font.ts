import  React, { useMemo } from "react";
import { getUserLanguage } from "@shared/libs";

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
  const locale = getUserLanguage();
  const isJapanese = locale.startsWith("ja");

  const fontFamily = useMemo(() => {
    if (isJapanese) {
      switch (weight) {
        case "thin": return "MPLUS1p-Thin";
        case "extralight": return "MPLUS1p-Light"; // extralight -> light 대체
        case "light": return "MPLUS1p-Light";
        case "regular": return "MPLUS1p-Regular";
        case "medium": return "MPLUS1p-Medium";
        case "semibold": return "MPLUS1p-Bold"; // semibold -> bold 대체
        case "bold": return "MPLUS1p-Bold";
        case "extrabold": return "MPLUS1p-ExtraBold";
        case "black": return "MPLUS1p-Black";
        default: return "MPLUS1p-Regular";
      }
    } else {
      switch (weight) {
        case "thin": return "Pretendard-Thin";
        case "extralight": return "Pretendard-ExtraLight";
        case "light": return "Pretendard-Light";
        case "regular": return "Pretendard-Regular";
        case "medium": return "Pretendard-Medium";
        case "semibold": return "Pretendard-SemiBold";
        case "bold": return "Pretendard-Bold";
        case "extrabold": return "Pretendard-ExtraBold";
        case "black": return "Pretendard-Black";
        default: return "Pretendard-Regular";
      }
    }
  }, [isJapanese, weight]);

  return fontFamily;
};
