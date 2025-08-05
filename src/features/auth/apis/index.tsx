import type { PassLoginResponse } from "@/src/auth/dto/pass-login.dto";
import { axiosClient } from "@shared/libs";
import type { MyDetails } from "@types/user";

export { appleReviewLogin } from "./apple-review-login";

export const getMySimpleDetails = () => axiosClient.get("/user");

export const checkExistsInstagram = (
  instagramId: string
): Promise<{ exists: boolean }> =>
  axiosClient.post("/auth/check/instagram", { instagramId });

export const getMyDetails = (): Promise<MyDetails> =>
  axiosClient.get("/user/details");

export const passLogin = (impUid: string): Promise<PassLoginResponse> =>
  axiosClient.post("/auth/pass-login", { impUid });

export const passKakao = (code: string): Promise<PassLoginResponse> =>
  axiosClient.post("/auth/oauth/kakao", { code });

export const getUserStatus = (
  phoneNumber: string
): Promise<{ status: string; rejectionReason?: string }> =>
  axiosClient.get(`/auth/status?phoneNumber=${phoneNumber}`);
export const reapplySignup = (data: {
  phoneNumber: string;
}): Promise<{
  success: boolean;
  message: string;
}> => axiosClient.post("/auth/status/reapply", data);
