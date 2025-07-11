import { axiosClient } from "@/src/shared/libs";
import type { User } from "../types";

export const sendEmailVerification = (email: string) =>
  axiosClient.post('/auth/email-verification/send', { email });

export const verifyEmailCode = (email: string, verificationCode: string, profileId: string) =>
  axiosClient.post('/auth/email-verification/verify', {
    email,
    verificationCode,
    profileId
  });

export const getProfileId = async (): Promise<string> => {
  const userInfo = await axiosClient.get('/user') as User;
  return userInfo.profileId;
};
