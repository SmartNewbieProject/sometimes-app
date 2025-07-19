export interface AppleReviewLoginRequest {
  appleId: string;
}

export interface AppleReviewLoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  role: string | null;
  isNewUser: boolean;
  certificationInfo?: {
    name: string;
    phone: string;
    gender: string;
    birthday: string;
  };
}