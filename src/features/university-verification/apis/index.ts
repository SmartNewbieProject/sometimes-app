import { axiosClient } from "@/src/shared/libs";
import type { User } from "../types";

export const sendEmailVerification = async (email: string) => {
  const { data } = await axiosClient.post<{ success: boolean }>(
    "/auth/email-verification/send",
    { email }
  );
  return data;
};

export const verifyEmailCode = async (
  email: string,
  verificationCode: string,
  profileId: string
) => {
  const { data } = await axiosClient.post<{ success: boolean }>(
    "/auth/email-verification/verify",
    { email, verificationCode, profileId }
  );
  return data;
};

export const getProfileId = async (): Promise<string> => {
  const { data } = await axiosClient.get<User>("/user");
  return data.profileId;
};

export const getUniversityVerificationStatus = async (
  profileId: string
): Promise<{ verifiedAt: string | null }> => {
  const { data } = await axiosClient.get<{ verifiedAt: string | null }>(
    `/profile/university-verification/${profileId}`
  );
  return data;
};

export const uploadUniversityVerificationImage = async (file: {
  uri: string;
  name?: string;
  type?: string;
}): Promise<{ url: string }> => {
  const form = new FormData();
  // @ts-ignore RN FormData 타입 보정
  form.append("file", {
    uri: file.uri,
    name: file.name ?? "university_document.jpg",
    type: file.type ?? "image/jpeg",
  });

  const { data } = await axiosClient.post<{ url: string }>(
    "/profile/university-verification/upload",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
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
