import type React from "react";
import {
  Text as RNText,
  Platform,
  type TextStyle,
  type TextProps as RNTextProps,
} from "react-native";
import { StyleSheet } from "react-native";
import colors, { getColor } from "../../../shared/constants/colors";

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
    case "white": return Platform.OS === 'web' ? getColor('text-inverse', colors.text.inverse) : colors.text.inverse;
    case "purple": return Platform.OS === 'web' ? getColor('brand-primary', colors.brand.primary) : colors.brand.primary;
    case "dark": return Platform.OS === 'web' ? getColor('brand-primary', colors.brand.primary) : colors.brand.primary;
    case "black": return Platform.OS === 'web' ? getColor('text-primary', colors.text.primary) : colors.text.primary;
    case "light": return Platform.OS === 'web' ? getColor('surface-tertiary', colors.surface.tertiary) : colors.surface.tertiary;
    case "pale-purple": return Platform.OS === 'web' ? getColor('text-disabled', colors.text.disabled) : colors.text.disabled;
    case "deepPurple": return Platform.OS === 'web' ? getColor('brand-deep', colors.brand.deep) : colors.brand.deep;
    case "gray": return Platform.OS === 'web' ? getColor('gray', colors.gray) : colors.gray;
    case "accent": return Platform.OS === 'web' ? getColor('brand-accent', colors.brand.accent) : colors.brand.accent;
    case "primary": return Platform.OS === 'web' ? getColor('text-primary', colors.text.primary) : colors.text.primary;
    case "secondary": return Platform.OS === 'web' ? getColor('text-secondary', colors.text.secondary) : colors.text.secondary;
    case "muted": return Platform.OS === 'web' ? getColor('text-muted', colors.text.muted) : colors.text.muted;
    case "disabled": return Platform.OS === 'web' ? getColor('text-disabled', colors.text.disabled) : colors.text.disabled;
    default: return Platform.OS === 'web' ? getColor('text-primary', colors.text.primary) : colors.text.primary;
  }
};

export type TextProps = Omit<RNTextProps, "style" | "children"> & {
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "10" | "12" | "13" | "18" | "20" | "chip";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  textColor?: "white" | "purple" | "dark" | "black" | "light" | "pale-purple" | "deepPurple" | "gray" | "accent" | "primary" | "secondary" | "muted" | "disabled";
  style?: TextStyle | TextStyle[];
  className?: string; // 호환성 유지
};

export const Text: React.FC<TextProps> = ({
  variant,
  size,
  weight,
  textColor,
  style,
  children,
  className, // 사용하지 않지만 호환성 유지
  ...rest
}) => {
  const textStyle: TextStyle = {
    fontSize: getFontSize(size),
    fontWeight: getFontWeight(weight),
    color: getTextColor(textColor),
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
