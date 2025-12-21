import { TextInput, type TextInputProps, View, TouchableOpacity, Platform, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useState } from 'react';
import EyeOn from '@assets/icons/eye-on.svg';
import EyeOff from '@assets/icons/eye-off.svg';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

type SizeType = 'sm' | 'md' | 'lg';
type StatusType = 'default' | 'error' | 'success';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  size?: SizeType;
  status?: StatusType;
  isDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textInputStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

export function Input({
  size = 'md',
  status = 'default',
  isDisabled,
  style,
  containerStyle,
  textInputStyle,
  placeholderTextColor = '#9CA3AF',
  editable = true,
  isPassword = false,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getFontSize = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      switch (size) {
        case 'sm': return 12;
        case 'md': return 14;
        case 'lg': return 18;
        default: return 14;
      }
    } else {
      switch (size) {
        case 'sm': return 13;
        case 'md': return 16;
        case 'lg': return 23;
        default: return 16;
      }
    }
  };

  const getHeightStyle = () => {
    switch (size) {
      case 'sm': return styles.heightSm;
      case 'lg': return styles.heightLg;
      default: return styles.heightMd;
    }
  };

  const getBorderStyle = () => {
    switch (status) {
      case 'error': return styles.borderError;
      case 'success': return styles.borderSuccess;
      default: return styles.borderDefault;
    }
  };

  return (
    <View style={containerStyle}>
      <View style={[
        styles.container,
        getHeightStyle(),
        getBorderStyle(),
        isDisabled && styles.disabled,
        style,
      ]}>
        <TextInput
          placeholderTextColor={placeholderTextColor}
          editable={!isDisabled && editable}
          secureTextEntry={isPassword && !isPasswordVisible}
          style={[styles.input, { fontSize: getFontSize() }, textInputStyle]}
          autoCapitalize="none"
          autoCorrect={false}
          importantForAutofill="yes"
          textContentType="none"
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: semanticColors.text.primary,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: Platform.OS === 'ios' ? 40 : undefined,
  },
  heightSm: {
    height: 40,
  },
  heightMd: {
    height: 48,
  },
  heightLg: {
    height: 56,
  },
  borderDefault: {
    borderBottomColor: semanticColors.border.default,
  },
  borderError: {
    borderBottomColor: '#FB7185',
  },
  borderSuccess: {
    borderBottomColor: '#22C55E',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
});
