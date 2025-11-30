import { TextInput, type TextInputProps, View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useState } from 'react';
import EyeOn from '@assets/icons/eye-on.svg';
import EyeOff from '@assets/icons/eye-off.svg';
import { semanticColors } from '../../constants/colors';

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
    width: '100%' as const,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
  };

  const sizeStyles = {
    sm: { height: 40 },
    md: { height: 48 },
    lg: { height: 56 },
  };

  // semanticColors 기반 상태 스타일
  const statusStyles = {
    default: { borderColor: semanticColors.surface.tertiary },
    error: { borderColor: semanticColors.state.error },
    success: { borderColor: semanticColors.state.success },
  };

  // semanticColors disabled 스타일
  const disabledStyles = isDisabled ? {
    opacity: 0.5,
    backgroundColor: semanticColors.surface.disabled,
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

  // 플랫폼별 폰트 크기 설정
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
    { flexDirection: 'row', alignItems: 'center' } as const,
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
