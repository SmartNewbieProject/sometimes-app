/**
 * JP SMS 인증코드 입력 화면
 * 6자리 코드 입력, 3분 타이머, 재발송 기능
 * 브랜드 가치: 설렘의 마지막 단계, 친근한 응원 메시지
 */

import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Input } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text size="20" weight="bold" style={styles.title}>
            {t('features.jp-auth.code_verification.title')} ✨
          </Text>
          <Text size="14" style={styles.subtitle}>
            {t('features.jp-auth.code_verification.subtitle', {
              phoneNumber: formatJpPhoneDisplay(phoneNumber),
            })}
          </Text>
        </View>

        <View style={styles.codeSection}>
          <View style={styles.codeInputContainer}>
            <Input
              size="lg"
              value={code}
              onChangeText={handleCodeChange}
              placeholder={t('features.jp-auth.code_verification.placeholder')}
              keyboardType="number-pad"
              maxLength={6}
              textInputStyle={styles.codeInput}
              autoFocus
            />
          </View>

          <View style={styles.timerContainer}>
            {!isTimerExpired ? (
              <View style={styles.timerBadge}>
                <Text size="14" weight="semibold" style={styles.timerText}>
                  {t('features.jp-auth.code_verification.remaining_time', {
                    time: formatTime(remainingSeconds),
                  })}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={onResend}
                disabled={isLoading}
                style={styles.resendContainer}
              >
                <Text size="14" style={styles.resendButton}>
                  {t('features.jp-auth.code_verification.resend')}
                </Text>
              </TouchableOpacity>
            )}
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
          disabled={!isCodeComplete || isLoading || isTimerExpired}
        >
          <Text textColor="white" size="18" weight="semibold">
            {isLoading
              ? t('features.jp-auth.code_verification.loading')
              : t('features.jp-auth.code_verification.submit_button')}
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
  subtitle: {
    textAlign: 'center',
    color: semanticColors.text.tertiary,
    lineHeight: 20,
  },
  codeSection: {
    alignItems: 'center',
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  codeInput: {
    fontSize: 32,
    letterSpacing: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerBadge: {
    backgroundColor: colors.lightPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: colors.primaryPurple,
  },
  resendContainer: {
    paddingVertical: 8,
  },
  resendButton: {
    color: colors.primaryPurple,
    textDecorationLine: 'underline',
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    width: '100%',
  },
  error: {
    color: '#DC2626',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingVertical: 24,
  },
});
