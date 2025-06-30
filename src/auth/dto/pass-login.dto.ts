/**
 * PASS 로그인 API 응답 타입
 */
export interface PassLoginResponse {
  isNewUser: boolean;
  accessToken?: string;
  refreshToken?: string;
  certificationInfo?: {
    name: string;
    phoneNumber: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE';
    ci: string;
    di: string;
  };
}

/**
 * 본인인증 검증 API 응답 타입
 */
export interface VerifyIdentityResponse {
  verified: boolean;
  message?: string;
}
