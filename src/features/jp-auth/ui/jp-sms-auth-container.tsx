/**
 * JP SMS 인증 컨테이너
 * step에 따라 전화번호 입력 또는 코드 검증 화면 렌더링
 */

import { useJpSmsLogin } from '../hooks/use-jp-sms-login';
import { PhoneInputScreen } from './phone-input-screen';
import { CodeVerificationScreen } from './code-verification-screen';

interface JpSmsAuthContainerProps {
  onCancel?: () => void;
}

export function JpSmsAuthContainer({ onCancel }: JpSmsAuthContainerProps) {
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

  if (step === 'phone_input') {
    return (
      <PhoneInputScreen
        phoneNumber={phoneNumber}
        onPhoneChange={setPhoneNumber}
        onSubmit={sendSmsCode}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <CodeVerificationScreen
      phoneNumber={phoneNumber}
      code={verificationCode}
      onCodeChange={setVerificationCode}
      onSubmit={verifySmsCode}
      onResend={resendCode}
      onBack={handleBack}
      remainingSeconds={remainingSeconds}
      isLoading={isLoading}
      error={error}
    />
  );
}
