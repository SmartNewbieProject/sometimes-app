import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { isValidElement, type ReactNode } from "react";
import { Platform, Pressable, TouchableOpacity } from "react-native";
import type { ViewStyle } from "react-native";
import { cn } from "../../libs/cn";
import { Text } from "../text";

const buttonStyles = cva(
  "rounded-[20] flex items-center flex flex-row gap-x-1.5 justify-center w-fit h-[50] py-2 px-6 transition-all duration-200",
  {
    variants: {
      variant: {
        primary: "bg-darkPurple hover:bg-darkPurple/80 active:bg-darkPurple/40",
        secondary:
          "bg-lightPurple hover:bg-darkPurple/20 active:bg-darkPurple/40",
        outline:
          "bg-transparent hover:bg-darkPurple/20 active:bg-darkPurple/40 border border-primaryPurple",
        white:
          "bg-surface-background border-primaryPurple border hover:bg-darkPurple/20 active:bg-darkPurple/40",
      },
      size: {
        md: "text-md h-[50px]",
        sm: "text-sm h-[40px]",
        lg: "text-lg h-[60px]",
        chip:
          Platform.OS === "web"
            ? "text-xs h-[28px] px-2"
            : "text-xs h-[34px] px-2",
      },
      flex: {
        "flex-1": "flex-1",
        "flex-0": "flex-0",
      },

      width: {
        full: "w-full",
        fit: "w-fit",
      },
      rounded: {
        full: "rounded-full",
        md: "rounded-lg",
        lg: "rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",

      rounded: "lg",
    },
  }
);

export type ButtonProps = VariantProps<typeof buttonStyles> & {
  children?: React.ReactNode;
  onPress?: () => void;
  prefix?: ReactNode;
  className?: string;
  textColor?: "white" | "purple" | "black" | "gray" | "dark";
  styles?: ViewStyle;
  disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  prefix,
  textColor,
  className = "",
  styles,
  flex = undefined,
}) => {
  const press = () => {
    if (disabled) return;
    onPress?.();
  };

  const getTextColor = () => {
    if (textColor) return textColor;
    switch (variant) {
      case "primary":
        return "white";
      case "secondary":
      case "outline":
      case "white":
        return "purple";
      default:
        return "white";
    }
  };

  const isComplexChild = isValidElement(children);

  return (
    <Pressable
      className={cn(buttonStyles({ variant, size, flex }), className)}
      onPress={press}
      style={[styles, disabled && { opacity: 0.5 }]}
    >
      {prefix}
      {isComplexChild ? (
        children
      ) : (
        <Text
          textColor={getTextColor()}
          size={size}
          weight="semibold"
          className="text-center whitespace-nowrap"
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};
