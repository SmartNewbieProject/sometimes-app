import type React from "react";
import type { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import colors, { semanticColors } from "@/src/shared/constants/colors";
import { Text } from "../text";

interface ButtonStyleProps {
  variant?: "primary" | "secondary" | "outline" | "white";
  size?: "md" | "sm" | "lg" | "chip";
  flex?: "flex-1" | "flex-0";
  width?: "full" | "fit";
  rounded?: "full" | "md" | "lg";
}

const createButtonStyles = (props: ButtonStyleProps) => {
  const {
    variant = "primary",
    size = "md",
    flex,
    width = "fit",
    rounded = "lg"
  } = props;

  const baseStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
    gap: 6,
    borderRadius: rounded === "full" ? 999 : rounded === "md" ? 8 : 12,
    transitionDuration: "200ms",
  };

  // Size styles
  const sizeStyles = {
    md: { minHeight: 50 },
    sm: { minHeight: 40 },
    lg: { minHeight: 60 },
    chip: {
      minHeight: Platform.OS === "web" ? 28 : 34,
      paddingHorizontal: 8,
    }
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: semanticColors.brand.primary,
    },
    secondary: {
      backgroundColor: semanticColors.brand.secondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: semanticColors.brand.primary,
    },
    white: {
      backgroundColor: semanticColors.surface.background,
      borderWidth: 1,
      borderColor: semanticColors.brand.primary,
    },
  };

  // Width styles
  const widthStyles = {
    full: { width: "100%" },
    fit: { width: "auto" },
  };

  // Flex styles
  const flexStyles = {
    "flex-1": { flex: 1 },
    "flex-0": { flex: 0 },
  };

  return StyleSheet.flatten([
    baseStyle,
    sizeStyles[size],
    variantStyles[variant],
    widthStyles[width],
    flex && flexStyles[flex],
  ]);
};

export type ButtonProps = ButtonStyleProps & {
  children?: React.ReactNode;
  onPress?: () => void;
  prefix?: ReactNode;
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
  styles,
  flex,
  width,
  rounded,
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

  const buttonStyle = createButtonStyles({
    variant,
    size,
    flex,
    width,
    rounded,
  });

  return (
    <Pressable
      style={[
        buttonStyle,
        styles,
        disabled && { opacity: 0.5 }
      ]}
      onPress={press}
    >
      {prefix}
      <Text
        textColor={getTextColor()}
        size={size}
        weight="semibold"
        style={buttonStyles.text}
      >
        {children}
      </Text>
    </Pressable>
  );
};

const buttonStyles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
});