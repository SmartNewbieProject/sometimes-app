import type React from "react";
import {
  Text as RNText,
  Platform,
  type TextStyle,
  type TextProps as RNTextProps,
} from "react-native";
import { StyleSheet } from "react-native";
import colors from "../../constants/colors";

// Tailwind 제거, StyleSheet 기반 스타일링으로 변경
const getFontSize = (size?: string | number) => {
  switch (size) {
    case "xs": return 12;
    case "sm": return 14;
    case "md": return 16;
    case "lg": return 18;
    case "xl": return 20;
    case "2xl": return 24;
    case "3xl": return 30;
    case "10": return 10;
    case "12": return 12;
    case "13": return 13;
    case "18": return 18;
    case "20": return 20;
    case "chip": return 13;
    default: return 16;
  }
};

const getFontWeight = (weight?: string) => {
  switch (weight) {
    case "light": return "300";
    case "normal": return "400";
    case "medium": return "500";
    case "semibold": return "600";
    case "bold": return "700";
    default: return "400";
  }
};

const getTextColor = (color?: string) => {
  switch (color) {
    case "white": return colors.text.inverse;
    case "purple": return colors.brand.primary;
    case "dark": return colors.brand.primary;
    case "black": return colors.text.primary;
    case "light": return colors.surface.tertiary;
    case "pale-purple": return colors.text.disabled;
    case "deepPurple": return colors.brand.deep;
    case "gray": return colors.gray;
    case "accent": return colors.brand.accent;
    case "primary": return colors.text.primary;
    case "secondary": return colors.text.secondary;
    case "muted": return colors.text.muted;
    case "disabled": return colors.text.disabled;
    default: return colors.text.primary;
  }
};

export type TextProps = Omit<RNTextProps, "style" | "children"> & {
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "10" | "12" | "13" | "18" | "20" | "chip";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  textColor?: "white" | "purple" | "dark" | "black" | "light" | "pale-purple" | "deepPurple" | "gray" | "accent" | "primary" | "secondary" | "muted" | "disabled";
  style?: TextStyle | TextStyle[];
};

export const Text: React.FC<TextProps> = ({
  variant,
  size,
  weight,
  textColor,
  style,
  children,
  ...rest
}) => {
  const textStyle: TextStyle = {
    fontSize: Platform.OS === 'ios'
      ? Math.round(getFontSize(size) * 0.85) // iOS에서 폰트 깨짐 방지
      : getFontSize(size),
    fontWeight: getFontWeight(weight),
    color: getTextColor(textColor),
    // 안티앨리어싱 강화
    fontFamily: Platform.OS === 'ios' ? 'Pretendard' : 'Pretendard',
    letterSpacing: Platform.OS === 'ios' ? -0.3 : 0,
    includeFontPadding: false,
      };

  const mergedStyle = Array.isArray(style)
    ? [textStyle, ...style.filter(Boolean)]
    : style
      ? [textStyle, style]
      : [textStyle];

  return (
    <RNText
      {...rest}
      style={mergedStyle}
    >
      {children}
    </RNText>
  );
};
