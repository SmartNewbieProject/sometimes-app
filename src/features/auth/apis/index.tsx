import type { PassLoginResponse } from "@/src/auth/dto/pass-login.dto";
import { axiosClient } from "@shared/libs";
// @ts-ignore
import type { MyDetails } from "@types/user";
type MySimpleDetails = {
  role: "admin" | "user";
  id: string;
  profileId: string;
  name: string;
};

export { appleReviewLogin } from "./apple-review-login";

export const getMySimpleDetails = (): Promise<MySimpleDetails> =>
  axiosClient.get("/user");

export const checkExistsInstagram = (
  instagramId: string
): Promise<{ exists: boolean }> =>
  axiosClient.post("/auth/check/instagram", { instagramId });

export const getMyDetails = (): Promise<MyDetails> =>
  axiosClient.get("/user/details");

export const passLogin = (impUid: string): Promise<PassLoginResponse> =>
  axiosClient.post("/auth/pass-login", { impUid });

export const passDevLogin = (): Promise<PassLoginResponse> =>
  axiosClient.post("/auth/pass-login/dev");

export const passKakao = (code: string): Promise<PassLoginResponse> =>
  axiosClient.post("/auth/oauth/kakao", { code });

export const getUserStatus = (
  phoneNumber: string
): Promise<{
  status: string;
  rejectionReason?: string;
  profileImage?: string;
}> => axiosClient.get(`/auth/status?phoneNumber=${phoneNumber}`);
export const reapplySignup = (data: {
  phoneNumber: string;
}): Promise<{
  success: boolean;
  message: string;
}> => axiosClient.post("/auth/status/reapply", data);
