export type LoginType = "pass" | "kakao" | "kakao_native" | "apple";

export type SignupForm = {
  name: string;
  phone: string;
  birthday: string;
  gender: "MALE" | "FEMALE";
  age?: number;
  universityId: string;
  area: string;
  departmentName: string;
  grade: string;
  studentNumber: string;
  instagramId: string;
  profileImages: string[];
  passVerified: boolean;
  kakaoId?: string;
  appleId?: string;
  referralCode?: string;
  loginType?: LoginType;
  identityVerificationId?: string;
  kakaoCode?: string;
  kakaoAccessToken?: string;
  phoneNumber?: string;
  universitySearchText?: string;
  signupStartTime?: number;
};

export interface SignupResponse {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  roles: string[];
}
