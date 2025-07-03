import { Button } from "@/src/shared/ui";
import { cn } from "@shared/libs/cn";
import { type VariantProps, cva } from "class-variance-authority";
import {
  Image,
  Platform,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

const chipSelector = cva("flex flex-row flex-wrap gap-2", {
  variants: {
    align: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
    },
  },
  defaultVariants: {
    align: "start",
  },
});

interface Option<T> {
  label: string;
  value: T;
  imageUrl?: string;
}

interface ChipSelectorProps<T> extends VariantProps<typeof chipSelector> {
  options: Option<T>[];
  value?: T | T[];
  onChange: (value: T) => void;
  multiple?: false;
  className?: string;
  buttonClassName?: string;
  style?: StyleProp<ViewStyle>;
}

interface MultipleChipSelectorProps<T>
  extends Omit<ChipSelectorProps<T>, "onChange" | "multiple"> {
  onChange: (value: T[]) => void;
  multiple: true;
}

export function ChipSelector<T>(
  props: ChipSelectorProps<T> | MultipleChipSelectorProps<T>
) {
  const isSelected = (optionValue: T) => {
    if (props.multiple) {
      return (props.value as T[])?.includes(optionValue);
    }
    return props.value === optionValue;
  };

  const handleSelect = (optionValue: T) => {
    if (props.multiple) {
      const currentValues = (props.value as T[]) || [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      props.onChange(newValues);
    } else {
      props.onChange(optionValue);
    }
  };

  return (
    <View
      style={props.style ?? {}}
      className={cn(chipSelector({ align: props.align }), props.className)}
    >
      {props.options.map((option) => (
        <Button
          key={String(option.value)}
          variant={isSelected(option.value) ? "primary" : "white"}
          textColor={isSelected(option.value) ? "white" : "purple"}
          onPress={() => handleSelect(option.value)}
          className={cn(
            Platform.OS === "web" ? "py-1 px-3" : "py-2 px-4",
            "rounded-xl flex flex-row items-center gap-x-2 justify-center",
            props.buttonClassName
          )}
          size="chip"
        >
          {option?.imageUrl && (
            <Image
              source={{ uri: option.imageUrl }}
              style={{ width: 16, height: 16, marginRight: 4 }}
            />
          )}
          {option.label}
        </Button>
      ))}
    </View>
  );
}
