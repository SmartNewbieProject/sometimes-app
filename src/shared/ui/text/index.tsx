import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import {
  Text as RNText,
  type TextStyle,
  type TextProps as RNTextProps, StyleSheet } from "react-native";
import { cn } from "../../libs/cn";
import { useAppFont, type FontWeight } from "../../hooks/use-app-font";

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
      "12": "text-[12px]",
      "13": "text-[13px]",
      "18": "text-[18px]",
      "20": "text-[20px]",
      chip: "text-[13px]",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    },
    weight: {
      thin: "font-thin",
      extralight: "font-extralight",
      light: "font-light",
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
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
    weight: "regular",
    textColor: "dark",
  },
});

export type TextProps = VariantProps<typeof textStyles> &
  Omit<RNTextProps, "style" | "children"> & {
    children?: React.ReactNode;
    className?: string;
    style?: TextStyle | TextStyle[];
    weight?: FontWeight;
  };

export const Text: React.FC<TextProps> = ({
  variant,
  size,
  weight = "regular",
  textColor,
  className = "",
  style,
  children,
  ...rest
}) => {
  const mergedStyle = Array.isArray(style)
    ? style.filter(Boolean)
    : style
      ? [style]
      : undefined;

  const fontFamily = useAppFont(weight);

  const textStyle = StyleSheet.flatten([{ fontFamily }, style]);

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
