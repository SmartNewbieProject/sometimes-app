/**
 * JP SMS 인증 컨테이너
 * step에 따라 전화번호 입력 또는 코드 검증 화면 렌더링
 * 한국 signup 레이아웃과 동일한 구조: DefaultLayout + Gradient + Header + Progress 바 + 컨텐츠
 */

import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { DefaultLayout } from '@/src/features/layout/ui';
import { Text, Header } from '@/src/shared/ui';
import { ProgressBar } from '@/src/shared/ui/progress-bar';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import colors from '@/src/shared/constants/colors';
import { useJpSmsLogin } from '../hooks/use-jp-sms-login';
import { PhoneInputScreen } from './phone-input-screen';
import { CodeVerificationScreen } from './code-verification-screen';

interface JpSmsAuthContainerProps {
  onCancel?: () => void;
}

export function JpSmsAuthContainer({ onCancel }: JpSmsAuthContainerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const progressWidth = width > 480 ? 448 : width - 32;

  const {
    step,
    isLoading,
    error,
    phoneNumber,
    verificationCode,
    remainingSeconds,
    setPhoneNumber,
    setVerificationCode,
    sendSmsCode,
    verifySmsCode,
    resendCode,
    goBack,
  } = useJpSmsLogin();

  const handleBack = () => {
    if (step === 'phone_input' && onCancel) {
      onCancel();
    } else {
      goBack();
    }
  };

  const progress = step === 'phone_input' ? 0.5 : 1;
  const stepTitle =
    step === 'phone_input'
      ? t('features.jp-auth.progress.step1')
      : t('features.jp-auth.progress.step2');

  return (
    <DefaultLayout style={styles.layout}>
      <PalePurpleGradient />

      {/* Header with back button */}
      <Header
        showBackButton
        onBackPress={handleBack}
        showLogo={false}
        title=""
        style={{ backgroundColor: 'transparent' }}
      />

      {/* Title and Progress bar */}
      <View style={styles.titleContainer}>
        <Text size="20" weight="bold" style={styles.title}>
          {stepTitle}
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <ProgressBar progress={progress} width={progressWidth} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {step === 'phone_input' ? (
          <PhoneInputScreen
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
            onSubmit={sendSmsCode}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <CodeVerificationScreen
            phoneNumber={phoneNumber}
            code={verificationCode}
            onCodeChange={setVerificationCode}
            onSubmit={verifySmsCode}
            onResend={resendCode}
            onBack={goBack}
            remainingSeconds={remainingSeconds}
            isLoading={isLoading}
            error={error}
          />
        )}
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  layout: {
    position: 'relative',
    backgroundColor: '#EAE0FF',
  },
  titleContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.black,
    fontFamily: 'Pretendard-Bold',
    lineHeight: 22,
    fontSize: 20,
  },
  progressBarContainer: {
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
});
