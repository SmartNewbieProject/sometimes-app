/**
 * JP 전화번호 입력 화면
 * +81 prefix와 함께 일본 휴대폰 번호 입력
 */

import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Input } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useTranslation } from 'react-i18next';
import {
  validateJpPhoneNumber,
  autoFormatJpPhoneInput,
} from '../utils/phone-format';

interface PhoneInputScreenProps {
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}

export function PhoneInputScreen({
  phoneNumber,
  onPhoneChange,
  onSubmit,
  isLoading,
  error,
}: PhoneInputScreenProps) {
  const { t } = useTranslation();
  const isValid = validateJpPhoneNumber(phoneNumber);

  const handlePhoneChange = (text: string) => {
    const formatted = autoFormatJpPhoneInput(text);
    onPhoneChange(formatted);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text size="24" weight="bold" style={styles.title}>
          {t('features.jp-auth.phone_input.title')}
        </Text>
        <Text size="14" style={styles.subtitle}>
          {t('features.jp-auth.phone_input.subtitle')}
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.prefixContainer}>
            <Text size="18" weight="semibold">
              +81
            </Text>
          </View>
          <View style={styles.inputWrapper}>
            <Input
              size="lg"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder={t('features.jp-auth.phone_input.placeholder')}
              keyboardType="phone-pad"
              maxLength={13}
            />
          </View>
        </View>

        {error && <Text size="14" style={styles.error}>{error}</Text>}

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="lg"
            rounded="full"
            width="full"
            onPress={onSubmit}
            disabled={!isValid || isLoading}
          >
            <Text textColor="white" size="18" weight="semibold">
              {isLoading
                ? t('features.jp-auth.phone_input.loading')
                : t('features.jp-auth.phone_input.submit_button')}
            </Text>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: semanticColors.text.tertiary,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  prefixContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  error: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
});
