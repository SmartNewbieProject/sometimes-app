import { cn } from "@/src/shared/libs/cn";
import { platform } from "@/src/shared/libs/platform";
import React, { type ReactNode } from "react";
import { View } from "react-native";

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
  return (
    <View
      className={cn(
        "w-full flex-row justify-between items-center px-3 bg-white",
        platform({
          ios: () => "pt-16 pb-4",
          android: () => "pt-12 pb-4",
          web: () => "pt-3 pb-4",
        }),
        className
      )}
    >
      {children}
    </View>
  );
}
