/**
 * JP SMS 인증 관련 타입 정의
 *
 * API 문서 기준:
 * - POST /jp/auth/sms/send - SMS 발송
 * - POST /jp/auth/sms/verify - SMS 검증
 * - POST /jp/auth/login - 로그인
 * - POST /jp/auth/signup - 회원가입
 */

// SMS 발송
export interface JpSmsSendRequest {
  phoneNumber: string; // +81-XX-XXXX-XXXX 형식
}

export interface JpSmsSendResponse {
  message: string; // "認証コードを送信しました"
}

// SMS 검증
export interface JpSmsVerifyRequest {
  phoneNumber: string; // +81-XX-XXXX-XXXX 형식
  code: string; // 6자리 인증코드
}

export interface JpSmsVerifyResponse {
  message: string; // "認証に成功しました"
}

// JP 로그인 (기존 회원)
export interface JpLoginRequest {
  phoneNumber: string;
}

export interface JpLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  roles: string[];
  isNewUser: boolean;
  userId?: string;
}

// JP 회원가입 (신규 회원)
export interface JpSignupRequest {
  phoneNumber: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthday: string; // YYYY-MM-DD
  age: number;
  universityId: string;
  departmentName: string;
  grade: string;
  studentNumber: string;
  profileImages: File[] | Blob[];
  mainImageIndex?: number;
  instagramId?: string;
  email?: string;
  referralCode?: string;
}

export interface JpSignupResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  roles: string[];
}

// JP 인증 정보 (AsyncStorage 저장용)
export interface JpCertificationInfo {
  phone: string;
  loginType: 'jp_sms';
  country: 'JP';
}

// SMS 인증 단계
export type JpAuthStep = 'phone_input' | 'code_verification';
