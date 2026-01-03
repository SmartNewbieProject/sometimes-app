import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Input, Text, Label } from '@/src/shared/ui';
import type { InputProps } from '@/src/shared/ui';

type LabelInputSize = 'sm' | 'md' | 'lg';

const getGapBySize = (size: LabelInputSize | undefined | null): number => {
  switch (size) {
    case 'sm': return 0;
    case 'lg': return 12;
    case 'md':
    default: return 8;
  }
};

export interface LabelInputProps extends Omit<InputProps, 'containerClassName'> {
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  onBlur?: () => void;
  error?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
  textColor?: "white" | "purple" | "light" | "dark" | "black" | "pale-purple";
  size?: LabelInputSize;
}

export function LabelInput({
  label,
  required = false,
  description,
  error,
  wrapperStyle,
  placeholder,
  onBlur,
  size,
  textColor,
  ...props
}: LabelInputProps) {
  return (
    <View style={[styles.container, { gap: getGapBySize(size) }, wrapperStyle]}>
      <Label
        label={label}
        required={required}
        size={size}
        textColor={textColor}
      />

      {description && (
        <Text
          size={size}
          textColor="black"
          style={styles.description}
        >
          {description}
        </Text>
      )}

      <Input
        size={size}
        placeholder={placeholder}
        status={error ? "error" : "default"}
        onBlur={onBlur}
        {...props}
      />

      {error && (
        <Text size={size === 'lg' ? 'md' : 'sm'} style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  description: {
    marginBottom: 4,
  },
  errorText: {
    color: '#FB7185',
  },
});
