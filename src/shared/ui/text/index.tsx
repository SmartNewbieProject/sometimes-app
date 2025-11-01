import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { Text as RNText, type TextStyle , StyleSheet } from "react-native";
import colors from "../../constants/colors";
import { cn } from "../../libs/cn";
import { useAppFont, type FontWeight } from "../../hooks/use-app-font";

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
      "12": "text-[12px]",
      "13": "text-[13px]",
      "18": "text-[18px]",
      "20": "text-[20px]",
      chip: "text-[13px]",
      lg: "text-lg",
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
    weight: "regular",
    textColor: "dark",
  },
});

export type TextProps = VariantProps<typeof textStyles> & {
  children: React.ReactNode;
  className?: string;
  style?: TextStyle;
  weight?: FontWeight;
  numberofLine?: number;
};


export const Text: React.FC<TextProps> = ({
  variant,
  size,
  weight = "regular",
  textColor,
  className = "",
  style,
  children,
  numberofLine,
}) => {
  const fontFamily = useAppFont(weight);

  const textStyle = StyleSheet.flatten([{ fontFamily }, style]);

  return (
    <RNText
      numberOfLines={numberofLine}
      className={cn(
        textStyles({ variant, size, weight, textColor }),
        className
      )}
      style={textStyle}
    >
      {children}
    </RNText>
  );
};
