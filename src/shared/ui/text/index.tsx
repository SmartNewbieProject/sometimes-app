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
      sm: "text-sm",
      md: "text-md",
      "10": "text-[10px]",
      "18": "text-[18px]",
      "20": "text-[20px]",
      "13": "text-[13px]",
      "12": "text-[12px]",
      chip: "text-[13px]",
      lg: "text-lg",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      light: "font-light",
      bold: "font-bold",
    },
    textColor: {
      white: "text-white",
      purple: "text-primaryPurple",
      dark: "text-darkPurple",
      black: "text-black",
      light: "text-lightPurple",
      "pale-purple": "text-[#9B94AB]",
      deepPurple: "text-strongPurple",
      gray: "text-gray",
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
  const mergedStyle = Array.isArray(style)
    ? style.filter(Boolean)
    : style
    ? [style]
    : undefined;

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
