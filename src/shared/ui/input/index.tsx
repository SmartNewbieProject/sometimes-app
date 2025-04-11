import { Button, TextInput, TextInputProps, View, TouchableOpacity } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { useState } from 'react';
import EyeOn from '@assets/icons/eye-on.svg';
import EyeOff from '@assets/icons/eye-off.svg';

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
  isPassword?: boolean;
}

export function Input({
  size,
  status,
  isDisabled,
  className,
  containerClassName,
  placeholderTextColor = '#9CA3AF',
  editable = true,
  isPassword = false,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className={containerClassName}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }} className={input({ size, status, isDisabled, className })}>
        <TextInput
          className={input({ size, status, isDisabled, className })}
          placeholderTextColor={placeholderTextColor}
          editable={!isDisabled && editable}
          secureTextEntry={isPassword && !isPasswordVisible}
          style={{ flex: 1 }}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? <EyeOff width={24} height={24} /> : <EyeOn width={24} height={24} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
