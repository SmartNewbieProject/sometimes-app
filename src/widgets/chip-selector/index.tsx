import { Button } from "@/src/shared/ui";
import { Image } from "expo-image";
import {
  Platform,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

type AlignType = "start" | "center" | "end";

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
  align?: AlignType;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
}

interface MultipleChipSelectorProps<T>
  extends Omit<ChipSelectorProps<T>, "onChange" | "multiple"> {
  onChange: (value: T[]) => void;
  multiple: true;
}

export function ChipSelector<T>(
  props: ChipSelectorProps<T> | MultipleChipSelectorProps<T>
) {
  const { align = "start", style, buttonStyle } = props;

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

  const getContainerStyle = () => {
    const alignmentStyle =
      align === "center"
        ? styles.containerCenter
        : align === "end"
          ? styles.containerEnd
          : styles.containerStart;

    return [styles.container, alignmentStyle, style];
  };

  const getButtonPaddingStyle = () => {
    return Platform.OS === "web" ? styles.buttonPaddingWeb : styles.buttonPaddingNative;
  };

  const getButtonStyles = () => {
    return StyleSheet.flatten([
      styles.chipButton,
      getButtonPaddingStyle(),
      styles.buttonBorderRadius,
      buttonStyle,
    ]);
  };

  return (
    <View style={getContainerStyle()}>
      {props.options.map((option) => (
        <Button
          key={String(option.value)}
          variant={isSelected(option.value) ? "primary" : "white"}
          textColor={isSelected(option.value) ? "white" : "purple"}
          onPress={() => handleSelect(option.value)}
          styles={getButtonStyles()}
          size="chip"
        >
          <View style={styles.chipContent}>
            {option?.imageUrl && option.imageUrl.trim() !== '' && (
              <Image
                source={{
                  uri: option.imageUrl,
                  cacheKey: `chip-${String(option.value)}-${option.imageUrl}`,
                }}
                style={styles.chipImage}
                contentFit="contain"
                transition={200}
                cachePolicy="memory-disk"
                onError={(error) => {
                  console.warn(`Failed to load chip image for "${option.label}":`, error.error);
                }}
              />
            )}
            <Text
              style={[
                styles.chipLabel,
                { color: isSelected(option.value) ? '#FFFFFF' : '#7A4AE2' }
              ]}
            >
              {option.label}
            </Text>
          </View>
        </Button>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  containerStart: {
    justifyContent: 'flex-start',
  },
  containerCenter: {
    justifyContent: 'center',
  },
  containerEnd: {
    justifyContent: 'flex-end',
  },
  chipButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 0,
  },
  buttonPaddingWeb: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  buttonPaddingNative: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonBorderRadius: {
    borderRadius: 12,
  },
  chipImage: {
    width: 16,
    height: 16,
    marginRight: 4,
    alignSelf: 'center',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    alignSelf: 'center',
  },
});
