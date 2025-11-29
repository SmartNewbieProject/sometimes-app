import { TextInput, type TextInputProps, View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useState } from 'react';
import EyeOn from '@assets/icons/eye-on.svg';
import EyeOff from '@assets/icons/eye-off.svg';

interface InputStyleProps {
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'error' | 'success';
  isDisabled?: boolean;
}

const createInputStyles = (props: InputStyleProps) => {
  const {
    size = 'md',
    status = 'default',
    isDisabled = false
  } = props;

  const baseStyle = {
    width: '100%',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: '#D1D5DB', // border-border-default
  };

  const sizeStyles = {
    sm: { minHeight: 40 },
    md: { minHeight: 48 },
    lg: { minHeight: 56 },
  };

  const statusStyles = {
    default: { borderColor: '#C4B5FD' }, // border-lightPurple
    error: { borderColor: '#F87171' }, // border-rose-400
    success: { borderColor: '#10B981' }, // border-green-500
  };

  const disabledStyles = isDisabled ? {
    opacity: 0.5,
    backgroundColor: '#F3F4F6', // bg-gray-100
  } : {};

  return StyleSheet.flatten([
    baseStyle,
    sizeStyles[size],
    statusStyles[status],
    disabledStyles
  ]);
};

export interface InputProps extends TextInputProps {
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'error' | 'success';
  isDisabled?: boolean;
  isPassword?: boolean;
}

export function Input({
  size = 'md',
  status = 'default',
  isDisabled = false,
  placeholderTextColor = '#9CA3AF',
  editable = true,
  isPassword = false,
  style,
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

  const inputStyles = createInputStyles({ size, status, isDisabled });
  const containerStyles = StyleSheet.flatten([
    { flexDirection: 'row', alignItems: 'center' },
    inputStyles
  ]);

  return (
    <View>
      <View style={containerStyles}>
        <TextInput
          style={StyleSheet.flatten([
            inputStyles,
            { flex: 1, fontSize: getFontSize() },
            style
          ])}
          placeholderTextColor={placeholderTextColor}
          editable={!isDisabled && editable}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? <EyeOn width={24} height={24} /> : <EyeOff width={24} height={24} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
