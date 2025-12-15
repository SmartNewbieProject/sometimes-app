import { cn } from "@/src/shared/libs/cn";
import { platform } from "@/src/shared/libs/platform";
import React, { type ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Container({
  children,
  className,
  centered = false,
  style,
}: ContainerProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={cn(
        "w-full flex-row justify-between items-center px-3 py-[12px] bg-surface-background",
        className
      )}
      style={[{ paddingTop: insets.top + 12 }, ...(Array.isArray(style) ? style : [style])]}
    >
      {children}
    </View>
  );
}
