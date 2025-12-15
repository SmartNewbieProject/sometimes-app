/**
 * PASS 로그인 API 응답 타입
 */
export interface PassLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  role: string;
  isNewUser: boolean;
  userId?: string;
  certificationInfo: {
    name: string;
    phone: string;
    gender: 'MALE' | 'FEMALE';
    birthday: string;
  };
}

/**
 * 본인인증 검증 API 응답 타입
 */
export interface VerifyIdentityResponse {
  verified: boolean;
  message?: string;
}
