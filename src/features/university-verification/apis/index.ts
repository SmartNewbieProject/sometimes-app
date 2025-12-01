import { axiosClient } from "@/src/shared/libs";
import type { User } from "../types";
import { Platform } from "react-native";

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

export const getUniversityVerificationStatus = async (
  profileId: string
): Promise<{ verifiedAt: string | null }> => {
  return axiosClient.get(`/profile/university-verification/${profileId}`);
};

export const uploadUniversityVerificationImage = async (file: {
  uri: string;
  name?: string;
  type?: string;
}): Promise<{ imageUrl: string; message: string }> => {
  const form = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    form.append("image", blob, file.name || "university_document.jpg");
  } else {
    form.append("image", {
      uri: file.uri,
      type: file.type || "image/jpeg",
      name: file.name || "university_document.jpg",
    } as any);
  }

  return axiosClient.post("/universities/certificate-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const requestUniversityVerification = async (params: {
  profileId: string;
  fileUrl: string;
  note?: string;
}): Promise<{
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}> => {
  const { data } = await axiosClient.post<{
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
  }>("/profile/university-verification/request", {
    profileId: params.profileId,
    fileUrl: params.fileUrl,
    note: params.note ?? "",
  });

  return data;
};
