/**
 * JP 전화번호 입력 화면
 * +81 prefix와 함께 일본 휴대폰 번호 입력
 * 브랜드 가치: 설렘 + 신뢰를 전달하는 친근한 UI
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Input } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text size="20" weight="bold" style={styles.title}>
            {t('features.jp-auth.phone_input.title')}
          </Text>
          <View style={styles.subtitleRow}>
            <Text size="14" style={styles.subtitle}>
              {t('features.jp-auth.phone_input.subtitle')}
            </Text>
            <Text size="16">🔐</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <View style={styles.prefixContainer}>
              <Text size="18" weight="semibold" style={styles.prefixText}>
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
                autoFocus
              />
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text size="14" style={styles.error}>{error}</Text>
            </View>
          )}
        </View>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    color: colors.black,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: semanticColors.text.tertiary,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefixContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.lightPurple,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryPurple,
  },
  prefixText: {
    color: colors.primaryPurple,
  },
  inputWrapper: {
    flex: 1,
  },
  errorContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  error: {
    color: '#DC2626',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingVertical: 24,
  },
});
