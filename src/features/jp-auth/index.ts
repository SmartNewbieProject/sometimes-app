/**
 * JP Auth Feature
 *
 * 일본 사용자를 위한 SMS 인증 기반 회원가입/로그인 기능
 */

// APIs
export { sendJpSms, verifyJpSms, jpLogin, jpSignup } from './apis';

// Types
export type {
  JpSmsSendRequest,
  JpSmsSendResponse,
  JpSmsVerifyRequest,
  JpSmsVerifyResponse,
  JpLoginRequest,
  JpLoginResponse,
  JpSignupRequest,
  JpSignupResponse,
  JpCertificationInfo,
  JpAuthStep,
} from './types';

// Utils
export {
  formatJpPhoneForApi,
  formatJpPhoneDisplay,
  validateJpPhoneNumber,
  autoFormatJpPhoneInput,
} from './utils/phone-format';

// Hooks
export { useJpSmsLogin } from './hooks/use-jp-sms-login';

// UI Components
export { JpSmsAuthContainer } from './ui/jp-sms-auth-container';
export { PhoneInputScreen } from './ui/phone-input-screen';
export { CodeVerificationScreen } from './ui/code-verification-screen';
