import { cn } from "@/src/shared/libs/cn";
import { platform } from "@/src/shared/libs/platform";
import React, { type ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}

export function Container({
  children,
  className,
  centered = false,
}: ContainerProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={cn(
        "w-full flex-row justify-between items-center px-3 bg-white",
        platform({
          ios: () => "pb-4",
          android: () => " pb-4",
          web: () => " pb-4",
        }),
        className
      )}
      style={{ paddingTop: insets.top + 12 }}
    >
      {children}
    </View>
  );
}
