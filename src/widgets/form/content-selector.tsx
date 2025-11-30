import {
  ContentSelector,
  type ContentSelectorProps,
} from "@/src/shared/ui/content-selector";
import type { ReactNode } from "react";
import { type UseControllerProps, useController } from "react-hook-form";
import { Pressable } from "react-native";

export interface FormContentSelectorProps
  extends UseControllerProps,
    Omit<ContentSelectorProps, "value" | "onChange"> {
  size?: "sm" | "md" | "lg";
  renderContent?: (value: string | null) => ReactNode;
  renderPlaceholder?: () => ReactNode;
  onPress?: () => Promise<string | null>;
  actionLabel?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function FormContentSelector({
  name,
  control,
  rules,
  size,
  renderContent,
  renderPlaceholder,
  onPress,
  actionLabel,
  activeColor,
  inactiveColor,
}: FormContentSelectorProps) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules,
  });

  const handlePress = async () => {
    if (onPress) {
      const result = await onPress();
      if (result) {
        onChange(result);
      }
    }
  };
  return (
    <Pressable onPress={handlePress}>
      <ContentSelector
        value={value}
        size={size}
        renderContent={renderContent}
        renderPlaceholder={renderPlaceholder}
        actionLabel={actionLabel}
        activeColor={activeColor}
        inactiveColor={inactiveColor}
      />
    </Pressable>
  );
}
