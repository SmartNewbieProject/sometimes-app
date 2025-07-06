import { axiosClient, dayUtils, fileUtils, platform } from "@/src/shared/libs";
import type { SignupForm } from "../hooks";
import { nanoid } from 'nanoid';
import type { AuthorizeSmsCode } from "@/app/auth/signup/types";

// YYYY-MM-DD 형식의 생년월일로부터 만나이 계산
const calculateAge = (birthday: string): number => {
  const today = dayUtils.create();
  const birthDate = dayUtils.create(birthday);
  return today.diff(birthDate, 'year');
};

export const getUnivs = async (): Promise<string[]> => {
  return axiosClient.get('/universities');
};

export const getDepartments = async (univ: string): Promise<string[]> => {
  return axiosClient.get(`/universities/departments?university=${univ}`);
};

const createFileObject = (imageUri: string, fileName: string) =>
  platform({
    web: () => {
      const blob = fileUtils.dataURLtoBlob(imageUri);
      return fileUtils.toFile(blob, fileName);
    },
    default: () => ({
      uri: imageUri,
      name: fileName,
      type: 'image/png'
    } as any)
  });

export const signup = (form: SignupForm): Promise<void> => {
  const formData = new FormData();
  formData.append('phoneNumber', form.phone);
  formData.append('name', form.name);
  formData.append('birthday', form.birthday);
  formData.append('gender', form.gender);
  const age = calculateAge(form.birthday);
  formData.append('age', age.toString());
  formData.append('universityName', form.universityName);
  formData.append('departmentName', form.departmentName);
  formData.append('grade', form.grade);
  formData.append('studentNumber', form.studentNumber);
  formData.append('instagramId', form.instagramId);

  form.profileImages.forEach(imageUri => {
    const file = createFileObject(imageUri, `${form.name}-${nanoid(6)}.png`);
    formData.append('profileImages', file);
  });

  return axiosClient.post('/auth/signup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const authenticateSmsCode = (smsCode: AuthorizeSmsCode): Promise<void> =>
  axiosClient.patch('/auth/sms', smsCode);

type Service = {
  getUnivs: () => Promise<string[]>;
  getDepartments: (univ: string) => Promise<string[]>;
  signup: (form: SignupForm) => Promise<void>;
  sendVerificationCode: (phoneNumber: string) => Promise<{ uniqueKey: string }>;
  authenticateSmsCode: (smsCode: AuthorizeSmsCode) => Promise<void>;
}

const sendVerificationCode = (phoneNumber: string): Promise<{ uniqueKey: string }> =>
  axiosClient.post('/auth/sms/send', { phoneNumber });


const apis: Service = {
  getUnivs,
  getDepartments,
  signup,
  sendVerificationCode,
  authenticateSmsCode,
};

export default apis;
