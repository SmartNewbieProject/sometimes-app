import { cn } from "@/src/shared/libs/cn";
import { type VariantProps, cva } from "class-variance-authority";
import { type ReactNode, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../text";

export const contentSelector = cva(
  "rounded-[20px] relative overflow-hidden border-2 ",
  {
    variants: {
      size: {
        sm: "w-[112px] h-[112px]",
        md: "w-[160px] h-[160px]",
        lg: "w-[233px] h-[233px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface ContentSelectorProps
  extends VariantProps<typeof contentSelector> {
  value?: string;

  className?: string;

  renderContent?: (value: string | null) => ReactNode;
  renderPlaceholder?: () => ReactNode;
  actionLabel?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function ContentSelector({
  value,

  size,
  className,

  renderContent,
  renderPlaceholder,
  actionLabel = undefined,
  activeColor = "#7A4AE2",
  inactiveColor = "#E2D5FF",
}: ContentSelectorProps) {
  console.log("value", `bg-[${inactiveColor}]`);
  return (
    <View>
      <View
        className={cn(
          contentSelector({ size }),

          className
        )}
        style={{
          borderColor: value ? activeColor : inactiveColor,
          borderWidth: 1,
        }}
      >
        {!!actionLabel && (
          <View
            className={cn(
              "absolute top-0  right-0 z-10 px-2.5 py-1 rounded-bl-lg  text-white"
            )}
            style={{
              backgroundColor: value ? activeColor : inactiveColor,
            }}
          >
            <Text size="sm" textColor="white">
              {actionLabel}
            </Text>
          </View>
        )}

        {value && renderContent ? renderContent(value) : null}

        {!value && renderPlaceholder ? (
          renderPlaceholder()
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="w-full h-full bg-[#F3EDFF] flex justify-center items-center">
              <Text size="sm" className="text-[#9B94AB]">
                콘텐츠 추가하기
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
