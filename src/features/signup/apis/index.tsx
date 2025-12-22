import type { AuthorizeSmsCode } from "@/app/auth/signup/types";
import { axiosClient, dayUtils, fileUtils, platform } from "@/src/shared/libs";
import { nanoid } from "nanoid";
import type { SignupForm } from "../hooks";
import type { AppleLoginResponse } from "../queries/use-apple-login";
import type { UniversitiesByRegion } from "../queries/use-universities";

// YYYY-MM-DD 형식의 생년월일로부터 만나이 계산
const calculateAge = (birthday: string): number => {
  const today = dayUtils.create();
  const birthDate = dayUtils.create(birthday);
  return today.diff(birthDate, "year");
};

export interface University {
  id: string;
  name: string;
  code: string;
  region: string;
  type: string;
  en: string | null;
}

export const getUnivs = async (): Promise<University[]> => {
  return axiosClient.get("/universities");
};

export const getTopUniversities = (): Promise<UniversitiesByRegion> => {
  return axiosClient.get("/universities/top");
};

export const searchUniversities = (
  searchText: string
): Promise<UniversitiesByRegion> => {
  return axiosClient.get(`/universities?name=${encodeURIComponent(searchText)}`);
};

export const getDepartments = async (univ: string): Promise<string[]> => {
  return axiosClient.get(`/universities/departments?universityId=${univ}`);
};

const createFileObject = (imageUri: string, fileName: string) =>
  platform({
    web: async () => {
      const blob = await fileUtils.dataURLtoBlob(imageUri);
      return fileUtils.toFile(blob, fileName);
    },
    default: () =>
      ({
        uri: imageUri,
        name: fileName,
        type: "image/png",
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any),
  });

export const checkPhoneNumberExists = (
  phoneNumber: string
): Promise<{ exists: boolean }> =>
  axiosClient.post("/auth/check/phone-number", { phoneNumber });

export const getUniversitiesByRegion = (
  regions: string[]
): Promise<UniversitiesByRegion> => {
  return axiosClient.post("/universities/regions", { regions });
};

export const checkPhoneNumberBlacklist = (
  phoneNumber: string
): Promise<{ isBlacklisted: boolean }> =>
  axiosClient.post("/auth/check/phone-number/blacklist", { phoneNumber });

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

export const signup = async (form: SignupForm): Promise<SignupResponse> => {
  const formData = new FormData();
  formData.append("phoneNumber", form.phone);
  formData.append("name", form.name);
  formData.append("birthday", form.birthday);
  formData.append("gender", form.gender);
  const age = calculateAge(form.birthday);
  formData.append("age", age.toString());
  formData.append("universityId", form.universityId);
  formData.append("departmentName", form.departmentName);
  formData.append("grade", form.grade);
  formData.append("studentNumber", form.studentNumber);
  formData.append("instagramId", form.instagramId);
  if (form.kakaoId) {
    formData.append("kakaoId", form.kakaoId);
  }
  if (form.appleId) {
    formData.append("appleId", form.appleId);
  }

  if (form?.referralCode && form.referralCode !== "") {
    formData.append("referralCode", form.referralCode);
  }

  const filePromises = form.profileImages.map((imageUri) =>
    createFileObject(imageUri, `${form.name}-${nanoid(6)}.png`)
  );
  const files = await Promise.all(filePromises);
  for (const file of files) {
    formData.append("profileImages", file);
  }

  formData.append("mainImageIndex", "0");

  return axiosClient.post("/auth/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const authenticateSmsCode = (smsCode: AuthorizeSmsCode): Promise<void> =>
  axiosClient.patch("/auth/sms", smsCode);

type Service = {
  getUnivs: () => Promise<string[]>;
  getDepartments: (univ: string) => Promise<string[]>;
  checkPhoneNumberExists: (phoneNumber: string) => Promise<{ exists: boolean }>;
  checkPhoneNumberBlacklist: (
    phoneNumber: string
  ) => Promise<{ isBlacklisted: boolean }>;
  signup: (form: SignupForm) => Promise<SignupResponse>;
  sendVerificationCode: (phoneNumber: string) => Promise<{ uniqueKey: string }>;
  authenticateSmsCode: (smsCode: AuthorizeSmsCode) => Promise<void>;
  postAppleLogin: (identityToken: string) => Promise<AppleLoginResponse>;
};

const sendVerificationCode = (
  phoneNumber: string
): Promise<{ uniqueKey: string }> =>
  axiosClient.post("/auth/sms/send", { phoneNumber });

const postAppleLogin = (appleId: string): Promise<AppleLoginResponse> => {
  return axiosClient.post("/auth/oauth/apple", {
    appleId: appleId,
  });
};

const apis: Service = {
  getUnivs,
  getDepartments,
  checkPhoneNumberExists,
  checkPhoneNumberBlacklist,
  signup,
  sendVerificationCode,
  authenticateSmsCode,
  postAppleLogin,
};

export default apis;
