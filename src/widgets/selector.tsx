import { Button, ButtonProps } from "@/src/shared/ui/button";
import { View } from "react-native";
import { cn } from "@shared/libs/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { Text } from "@/src/shared/ui";
const selector = cva("flex gap-2", {
  variants: {
    direction: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    variant: {
      default: "",
      circle: "rounded-full aspect-square",
    },
  },
  defaultVariants: {
    direction: "horizontal",
    variant: "default",
  },
});

interface Option {
  label: string;
  value: string;
}

interface TopDownText {
  top: string;
  bottom: string;
}

interface SelectorProps extends VariantProps<typeof selector> {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  variant?: "default" | "circle";
  buttonClassName?: string;
  topDownText?: TopDownText;
  buttonProps?: Pick<ButtonProps, 'variant' | 'textColor' | 'className'>;
}

export function Selector({
  options,
  value,
  onChange,
  onBlur,
  direction,
  variant,
  className,
  buttonClassName,
  topDownText,
  buttonProps,
}: SelectorProps) {
  return (
    <View className="flex flex-col items-center">
      {topDownText && (
        <Text size="md" textColor="purple" className="mb-2">
          {topDownText.top}
        </Text>
      )}
      
      <View className={cn(
        selector({ direction, variant }),
        "flex-shrink-0",
        className
      )}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "primary" : "white"}
            textColor={value === option.value ? "white" : "purple"}
            onPress={() => {
              onChange(option.value);
              onBlur?.();
            }}
            className={cn(
              direction === "horizontal" ? "flex-1" : "w-full",
              variant === "circle" && "h-[48px] w-[48px] border border-primaryPurple",
              buttonClassName,
            )}
            {...buttonProps}
          >
            {option.label}
          </Button>
        ))}
      </View>

      {topDownText && (
        <View>
          <Text size="md" textColor="purple" className="mt-2">
            {topDownText.bottom}
          </Text>
        </View>
      )}
    </View>
  );
}
