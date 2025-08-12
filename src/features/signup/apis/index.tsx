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

export const getUnivs = async (): Promise<string[]> => {
  return axiosClient.get("/universities");
};

export const getDepartments = async (univ: string): Promise<string[]> => {
  return axiosClient.get(`/universities/departments?university=${univ}`);
};

const createFileObject = (imageUri: string, fileName: string) =>
  platform({
    web: () => {
      console.log("test", imageUri, fileName);
      const blob = fileUtils.dataURLtoBlob(imageUri);
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

export const signup = (form: SignupForm): Promise<void> => {
  const formData = new FormData();
  formData.append("phoneNumber", form.phone);
  formData.append("name", form.name);
  formData.append("birthday", form.birthday);
  formData.append("gender", form.gender);
  const age = calculateAge(form.birthday);
  formData.append("age", age.toString());
  formData.append("universityName", form.universityName);
  formData.append("departmentName", form.departmentName);
  formData.append("grade", form.grade);
  formData.append("studentNumber", form.studentNumber);
  formData.append("instagramId", form.instagramId);
  if (form.kakaoId) {
    formData.append("kakaoId", form.kakaoId);
  }
  // biome-ignore lint/complexity/noForEach: <explanation>
  form.profileImages.forEach((imageUri) => {
    const file = createFileObject(imageUri, `${form.name}-${nanoid(6)}.png`);
    formData.append("profileImages", file);
  });

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
  signup: (form: SignupForm) => Promise<void>;
  sendVerificationCode: (phoneNumber: string) => Promise<{ uniqueKey: string }>;
  authenticateSmsCode: (smsCode: AuthorizeSmsCode) => Promise<void>;
  postAppleLogin: (identityToken: string) => Promise<AppleLoginResponse>;
};

const sendVerificationCode = (
  phoneNumber: string
): Promise<{ uniqueKey: string }> =>
  axiosClient.post("/auth/sms/send", { phoneNumber });

const postAppleLogin = (identityToken: string): Promise<AppleLoginResponse> => {
  return axiosClient.post("/auth/login/apple", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appleId: identityToken }),
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
