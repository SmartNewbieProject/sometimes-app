import type React from "react";
import { isValidElement, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Text } from "../text";

export type ButtonVariant = "primary" | "secondary" | "outline" | "white";
export type ButtonSize = "sm" | "md" | "lg" | "chip";
export type ButtonWidth = "full" | "fit";
export type ButtonRounded = "full" | "md" | "lg";

export type ButtonProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  prefix?: ReactNode;
  textColor?: "white" | "purple" | "black" | "gray" | "dark";
  styles?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  rounded?: ButtonRounded;
  className?: string;
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
  style,
  width,
  rounded = "lg",
  className,
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
        return "gray";
      case "outline":
      case "white":
        return "purple";
      default:
        return "white";
    }
  };

  const isComplexChild = isValidElement(children);

  const buttonStyle: StyleProp<ViewStyle> = [
    baseStyles.button,
    variantStyles[variant],
    sizeStyles[size],
    width && widthStyles[width],
    rounded && roundedStyles[rounded],
    disabled && baseStyles.disabled,
    styles,
    style,
  ];

  return (
    <Pressable onPress={press} style={buttonStyle}>
      {prefix}
      {isComplexChild ? (
        children
      ) : (
        <Text
          textColor={getTextColor()}
          size={size}
          weight="semibold"
          style={baseStyles.text}
          numberOfLines={1}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};

const baseStyles = StyleSheet.create({
  button: {
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
    gap: 8,
    ...Platform.select({
      web: {
        display: 'flex',
      } as any,
    }),
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: "center",
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
      } as any,
    }),
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: semanticColors.brand.primary,
  },
  secondary: {
    backgroundColor: semanticColors.surface.surface,
    borderWidth: 2,
    borderColor: semanticColors.border.smooth,
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
});

const sizeStyles = StyleSheet.create({
  sm: {
    height: 40,
  },
  md: {
    height: 50,
  },
  lg: {
    height: 60,
  },
  chip: {
    height: Platform.OS === "web" ? 28 : 34,
    paddingHorizontal: 8,
  },
});

const widthStyles = StyleSheet.create({
  full: {
    width: "100%",
  },
  fit: {
    alignSelf: "flex-start",
  },
});

const roundedStyles = StyleSheet.create({
  full: {
    borderRadius: 9999,
  },
  md: {
    borderRadius: 12,
  },
  lg: {
    borderRadius: 16,
  },
});
