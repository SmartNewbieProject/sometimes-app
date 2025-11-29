import { View, StyleSheet } from 'react-native';
import { Input } from '@/src/shared/ui/input';
import { Text } from '@/src/shared/ui/text';
import { Label } from '@/src/shared/ui/label';
import type { InputProps } from '@/src/shared/ui/input';

export interface LabelInputProps extends InputProps {
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  onBlur?: () => void;
  error?: string;
  wrapperClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  textColor?: "white" | "purple" | "light" | "dark" | "black" | "pale-purple";
}

const createLabelInputStyles = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const sizeStyles = {
    sm: { gap: 0 },
    md: { gap: 8 },
    lg: { gap: 12 },
  };

  return {
    container: {
      flexDirection: 'column' as const,
      ...sizeStyles[size],
    },
    description: {
      marginBottom: 4,
    },
    input: {
      marginBottom: 4,
    },
    error: {
      color: '#f87171',
    },
  };
};

export function LabelInput({
  label,
  required = false,
  description,
  error,
  wrapperClassName,
  containerClassName,
  placeholder,
  onBlur,
  size = 'md',
  textColor,
  ...props
}: LabelInputProps) {
  const styles = createLabelInputStyles({ size });

  return (
    <View style={styles.container}>
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
        containerClassName={containerClassName}
        placeholder={placeholder}
        status={error ? "error" : "default"}
        onBlur={onBlur}
        style={styles.input}
        {...props}
      />

      {error && (
        <Text size={size === 'lg' ? 'md' : 'sm'} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
