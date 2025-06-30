export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  role: "user" | "admin";
}

// PASS 로그인 응답 타입 정의
export type PassLoginResponse = {
  isNewUser: boolean;
  certificationInfo?: {
    name: string;
    phoneNumber: string;
    identityNumber: string;
  };
  accessToken?: string;
  refreshToken?: string;
}
