import { axiosClient, dayUtils, fileUtils, platform } from "@/src/shared/libs";
import type { SignupForm } from "../hooks";
import { nanoid } from 'nanoid';
import { AuthorizeSmsCode } from "@/app/auth/signup/types";

export const getUnivs = async (): Promise<string[]> => {
  return axiosClient.get('/universities');
};

export const getDepartments = async (univ: string): Promise<string[]> => {
  return axiosClient.get(`/universities/departments?university=${univ}`);
};

export const signup = (form: SignupForm): Promise<void> => {
  const birthday = dayUtils.getDayBy6Digit(form.birthday);
  const formData = new FormData();

  // 기본 폼 데이터 추가
  formData.append('email', form.email);
  formData.append('password', form.password);
  formData.append('phoneNumber', form.phoneNumber);
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

  // 플랫폼별 이미지 처리
  platform({
    web: () => {
      // 웹에서는 기존 방식 사용
      const files = form.profileImages
        .map(fileUtils.dataURLtoBlob)
        .map(blob => fileUtils.toFile(blob, `${form.email}-${nanoid(6)}.png`));

      for (const file of files) {
        formData.append('profileImages', file);
      }
    },
    default: () => {
      // React Native에서는 URI를 직접 사용
      console.log('React Native 이미지 업로드:', form.profileImages);
      form.profileImages.forEach((imageUri, index) => {
        const fileObject = {
          uri: imageUri,
          name: `${form.email}-${nanoid(6)}.png`,
          type: 'image/png'
        };
        console.log(`이미지 ${index + 1} 파일 객체:`, fileObject);
        formData.append('profileImages', fileObject as any);
      });
    }
  });

  return axiosClient.post('/auth/signup', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
