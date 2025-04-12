import { View } from 'react-native';
import { Input, Text } from '@/src/shared/ui';
import type { InputProps } from '@/src/shared/ui';
import { cn } from '@shared/libs/cn';

export interface LabelInputProps extends InputProps {
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
  ...props
}: LabelInputProps) {
  return (
    <View className={cn("space-y-2", wrapperClassName)}>
      <View className="flex-row items-center gap-x-1">
        <Text size="md" weight="semibold" textColor="purple">
          {label}
        </Text>
        {required && (
          <Text size="sm" textColor="purple">
            *
          </Text>
        )}
      </View>
      
      {description && (
        <Text size="sm" textColor="black" className="mb-1">
          {description}
        </Text>
      )}

      <Input
        containerClassName={cn("mb-1", containerClassName)}
        placeholder={placeholder}
        status={error ? "error" : "default"}
        onBlur={onBlur}
        {...props}
      />

      {error && (
        <Text size="sm" className="text-rose-400">
          {error}
        </Text>
      )}
    </View>
  );
}
