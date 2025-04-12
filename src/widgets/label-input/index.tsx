import { View } from 'react-native';
import { Input, Text } from '@/src/shared/ui';
import type { InputProps } from '@/src/shared/ui';
import { cn } from '@shared/libs/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const labelInput = cva('space-y-2', {
  variants: {
    size: {
      sm: 'gap-y-1',
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
  ...props
}: LabelInputProps) {
  return (
    <View className={cn(labelInput({ size }), wrapperClassName)}>
      <View className="flex-row items-center gap-x-1">
        <Text 
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} 
          weight="semibold" 
          textColor="purple"
        >
          {label}
        </Text>
        {required && (
          <Text size={size === 'lg' ? 'md' : 'sm'} textColor="purple">
            *
          </Text>
        )}
      </View>
      
      {description && (
        <Text 
          size={size === 'sm' ? 'xs' : 'sm'} 
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
