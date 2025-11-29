import { Button } from "@/src/shared/ui/button";
import {
  Image,
  Platform,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

interface Option<T> {
  label: string;
  value: T;
  imageUrl?: string;
}

interface ChipSelectorProps<T> {
  options: Option<T>[];
  value?: T | T[];
  onChange: (value: T) => void;
  multiple?: false;
  className?: string;
  buttonClassName?: string;
  style?: StyleProp<ViewStyle>;
  align?: 'start' | 'center' | 'end';
}

interface MultipleChipSelectorProps<T>
  extends Omit<ChipSelectorProps<T>, "onChange" | "multiple"> {
  onChange: (value: T[]) => void;
  multiple: true;
}

const createChipSelectorStyles = ({ align }: { align?: 'start' | 'center' | 'end' }) => {
  const alignStyles = {
    start: { justifyContent: 'flex-start' as const },
    center: { justifyContent: 'center' as const },
    end: { justifyContent: 'flex-end' as const },
  };

  return {
    container: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
      ...(align && alignStyles[align]),
    },
    button: {
      borderRadius: 12,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      justifyContent: 'center' as const,
      paddingHorizontal: Platform.OS === "web" ? 12 : 16,
      paddingVertical: Platform.OS === "web" ? 4 : 8,
    },
    image: {
      width: 16,
      height: 16,
      marginRight: 4,
      marginTop: 2,
    },
  };
};

export function ChipSelector<T>(
  props: ChipSelectorProps<T> | MultipleChipSelectorProps<T>
) {
  const { align = 'start' } = props;
  const styles = createChipSelectorStyles({ align });

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
    <View style={[styles.container, props.style]}>
      {props.options.map((option) => (
        <Button
          key={String(option.value)}
          variant={isSelected(option.value) ? "primary" : "white"}
          textColor={isSelected(option.value) ? "white" : "purple"}
          onPress={() => handleSelect(option.value)}
          style={[styles.button, props.buttonClassName ? {} : {}]}
          size="chip"
        >
          {option?.imageUrl && (
            <Image
              source={{ uri: option.imageUrl }}
              style={styles.image}
            />
          )}
          {option.label}
        </Button>
      ))}
    </View>
  );
}
