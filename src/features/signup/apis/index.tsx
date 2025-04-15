import { axiosClient, dayUtils, fileUtils } from "@/src/shared/libs";
import type { SignupForm } from "../hooks";
import { nanoid } from 'nanoid';

export const getUnivs = async (): Promise<string[]> => {
  return axiosClient.get('/universities');
};

export const getDepartments = async (univ: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 10000));
  return axiosClient.get(`/universities/departments?university=${univ}`);
};

export const signup = (form: SignupForm): Promise<void> => {
  const files = form.profileImages
  .map(fileUtils.dataURLtoBlob)
  .map(blob => fileUtils.toFile(blob, `${form.email}-${nanoid(6)}.png`));
  const birthday = dayUtils.getDayBy6Digit(form.birthday);

  const formData = new FormData();
  formData.append('email', form.email);
  formData.append('password', form.password);
  formData.append('name', form.name);
  formData.append('birthday', birthday.format('YYYY-MM-DD'));
  formData.append('gender', form.gender);
  formData.append('mbti', form.mbti);
  formData.append('universityName', form.universityName);
  formData.append('age', dayUtils.getAgeBy6Digit(form.birthday).toString());
  formData.append('departmentName', form.departmentName);
  formData.append('grade', form.grade);
  formData.append('studentNumber', form.studentNumber);
  formData.append('instagramId', form.instagramId);

  for (const file of files) {
    formData.append('profileImages', file);
  }

  return axiosClient.post('/auth/signup', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type Service = {
  getUnivs: () => Promise<string[]>;
  getDepartments: (univ: string) => Promise<string[]>;
  signup: (form: SignupForm) => Promise<void>;
}

const apis: Service = {
  getUnivs,
  getDepartments,
  signup,
};

export default apis;
