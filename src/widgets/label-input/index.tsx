import { View } from 'react-native';
import { Input, Text, Label } from '@/src/shared/ui';
import type { InputProps } from '@/src/shared/ui';
import { cn } from '@shared/libs/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const labelInput = cva('flex flex-col', {
  variants: {
    size: {
      sm: 'gap-y-0',
      md: 'gap-y-2',
      lg: 'gap-y-3',
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export interface LabelInputProps extends InputProps, VariantProps<typeof labelInput> {
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  onBlur?: () => void;
  error?: string;
  wrapperClassName?: string;
  textColor?: "white" | "purple" | "light" | "dark" | "black" | "pale-purple";
}

export function LabelInput({
  label,
  required = false,
  description,
  error,
  wrapperClassName,
  containerClassName,
  placeholder,
  onBlur,
  size,
  textColor,
  ...props
}: LabelInputProps) {
  return (
    <View className={cn(labelInput({ size }), wrapperClassName)}>
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
          className="mb-1"
        >
          {description}
        </Text>
      )}

      <Input
        size={size}
        containerClassName={cn("mb-1", containerClassName)}
        placeholder={placeholder}
        status={error ? "error" : "default"}
        onBlur={onBlur}
        {...props}
      />

      {error && (
        <Text size={size === 'lg' ? 'md' : 'sm'} className="text-rose-400">
          {error}
        </Text>
      )}
    </View>
  );
}
