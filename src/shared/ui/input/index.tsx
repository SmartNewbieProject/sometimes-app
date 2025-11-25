import { TextInput, type TextInputProps, View, TouchableOpacity, Platform } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { useState } from 'react';
import EyeOn from '@assets/icons/eye-on.svg';
import EyeOff from '@assets/icons/eye-off.svg';

const input = cva(
  'w-full bg-transparent border-b border-border-default',
  {
    variants: {
      size: {
        sm: 'h-10',
        md: 'h-12',
        lg: 'h-14',
      },
      status: {
        default: 'border-lightPurple',
        error: 'border-rose-400',
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

export interface InputProps extends Omit<TextInputProps, 'style'>, VariantProps<typeof input> {
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

  // 플랫폼별 폰트 크기 설정 (플레이스홀더와 입력 텍스트 모두 적용)
  const getFontSize = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      switch (size) {
        case 'sm': return 12;
        case 'md': return 14;
        case 'lg': return 18;
        default: return 14;
      }
    } else {
      // 웹에서는 기존 크기 유지
      switch (size) {
        case 'sm': return 13;
        case 'md': return 16;
        case 'lg': return 23;
        default: return 16;
      }
    }
  };

  return (
    <View className={containerClassName}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }} className={input({ size, status, isDisabled, className })}>
        <TextInput
          className={input({ size, status, isDisabled, className })}
          placeholderTextColor={placeholderTextColor}
          editable={!isDisabled && editable}
          secureTextEntry={isPassword && !isPasswordVisible}
          style={{ flex: 1, fontSize: getFontSize() }}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible  ? <EyeOn width={24} height={24} /> : <EyeOff width={24} height={24} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
