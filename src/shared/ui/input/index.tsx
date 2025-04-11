import { TextInput, TextInputProps, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const input = cva(
  'w-full bg-transparent border-b border-[#E7E9EC]', 
  {
    variants: {
      size: {
        sm: 'h-10 text-sm',
        md: 'h-12 text-md',
        lg: 'h-14 text-lg',
      },
      status: {
        default: 'border-lightPurple',
        error: 'border-red-500',
        success: 'border-green-500',
      },
      isDisabled: {
        true: 'opacity-50 bg-gray-100',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'default',
    },
  }
);

interface InputProps extends Omit<TextInputProps, 'style'>, VariantProps<typeof input> {
  className?: string;
  containerClassName?: string;
}

export function Input({
  size,
  status,
  isDisabled,
  className,
  containerClassName,
  placeholderTextColor = '#9CA3AF',
  editable = true,
  ...props
}: InputProps) {
  return (
    <View className={containerClassName}>
      <TextInput
        className={input({ size, status, isDisabled, className })}
        placeholderTextColor={placeholderTextColor}
        editable={!isDisabled && editable}
        {...props}
      />
    </View>
  );
}
