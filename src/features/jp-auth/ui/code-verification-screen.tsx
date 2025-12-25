/**
 * JP SMS 인증코드 입력 화면
 * 6자리 코드 입력, 3분 타이머, 재발송 기능
 */

import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Input } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useTranslation } from 'react-i18next';
import { formatJpPhoneDisplay } from '../utils/phone-format';

interface CodeVerificationScreenProps {
  phoneNumber: string;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
  remainingSeconds: number;
  isLoading: boolean;
  error: string | null;
}

export function CodeVerificationScreen({
  phoneNumber,
  code,
  onCodeChange,
  onSubmit,
  onResend,
  onBack,
  remainingSeconds,
  isLoading,
  error,
}: CodeVerificationScreenProps) {
  const { t } = useTranslation();
  const isCodeComplete = code.length === 6;
  const isTimerExpired = remainingSeconds === 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    onCodeChange(cleaned);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text size="16" textColor="primary">
            ← {t('features.jp-auth.code_verification.back')}
          </Text>
        </TouchableOpacity>

        <Text size="24" weight="bold" style={styles.title}>
          {t('features.jp-auth.code_verification.title')}
        </Text>
        <Text size="14" style={styles.subtitle}>
          {t('features.jp-auth.code_verification.subtitle', {
            phoneNumber: formatJpPhoneDisplay(phoneNumber),
          })}
        </Text>

        <View style={styles.codeInputContainer}>
          <Input
            size="lg"
            value={code}
            onChangeText={handleCodeChange}
            placeholder={t('features.jp-auth.code_verification.placeholder')}
            keyboardType="number-pad"
            maxLength={6}
            textInputStyle={styles.codeInput}
          />
        </View>

        <View style={styles.timerContainer}>
          {!isTimerExpired ? (
            <Text size="14" style={styles.timer}>
              {t('features.jp-auth.code_verification.remaining_time', {
                time: formatTime(remainingSeconds),
              })}
            </Text>
          ) : (
            <TouchableOpacity onPress={onResend} disabled={isLoading}>
              <Text size="14" style={styles.resendButton}>
                {t('features.jp-auth.code_verification.resend')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {error && <Text size="14" style={styles.error}>{error}</Text>}

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="lg"
            rounded="full"
            width="full"
            onPress={onSubmit}
            disabled={!isCodeComplete || isLoading || isTimerExpired}
          >
            <Text textColor="white" size="18" weight="semibold">
              {isLoading
                ? t('features.jp-auth.code_verification.loading')
                : t('features.jp-auth.code_verification.submit_button')}
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
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
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
  codeInputContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeInput: {
    fontSize: 28,
    letterSpacing: 8,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timer: {
    color: semanticColors.text.tertiary,
  },
  resendButton: {
    color: semanticColors.brand.primary,
    textDecorationLine: 'underline',
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
