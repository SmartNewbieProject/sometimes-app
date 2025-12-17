import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import {
  Text as RNText,
  type TextStyle,
  type TextProps as RNTextProps,
} from "react-native";
import { cn } from "../../libs/cn";

const textStyles = cva("text-base", {
  variants: {
    variant: {
      primary: "text-darkPurple",
      secondary: "text-lightPurple",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-md",
      "10": "text-[10px]",
      "18": "text-[18px]",
      "20": "text-[20px]",
      "13": "text-[13px]",
      "12": "text-[12px]",
      chip: "text-[13px]",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      light: "font-light",
      bold: "font-bold",
    },
    textColor: {
      white: "text-text-inverse",
      purple: "text-primaryPurple",
      dark: "text-darkPurple",
      black: "text-text-primary",
      light: "text-lightPurple",
      "pale-purple": "text-text-disabled",
      deepPurple: "text-strongPurple",
      gray: "text-gray",
      accent: "text-brand-accent",
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      muted: "text-text-muted",
      disabled: "text-text-disabled",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    weight: "normal",
    textColor: "dark",
  },
});

export type TextProps = VariantProps<typeof textStyles> &
  Omit<RNTextProps, "style" | "children"> & {
    children?: React.ReactNode;
    className?: string;
    style?: TextStyle | TextStyle[];
  };

export const Text: React.FC<TextProps> = ({
  variant,
  size,
  weight,
  textColor,
  className = "",
  style,
  children,
  ...rest
}) => {
  const getFontFamily = () => {
    switch (weight) {
      case "light":
        return "Pretendard-Light";
      case "normal":
        return "Pretendard-Regular";
      case "medium":
        return "Pretendard-Medium";
      case "semibold":
        return "Pretendard-SemiBold";
      case "bold":
        return "Pretendard-Bold";
      default:
        return "Pretendard-Regular";
    }
  };

  const mergedStyle = Array.isArray(style)
    ? [{ fontFamily: getFontFamily() }, ...style.filter(Boolean)]
    : style
      ? [{ fontFamily: getFontFamily() }, style]
      : [{ fontFamily: getFontFamily() }];

  return (
    <RNText
      {...rest}
      className={cn(
        textStyles({ variant, size, weight, textColor }),
        className
      )}
      style={mergedStyle}
    >
      {children}
    </RNText>
  );
};
