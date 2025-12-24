/**
 * JP SMS 인증 API
 *
 * 엔드포인트:
 * - POST /jp/auth/sms/send - SMS 인증코드 발송
 * - POST /jp/auth/sms/verify - SMS 인증코드 검증
 * - POST /jp/auth/login - 로그인 (기존 회원)
 * - POST /jp/auth/signup - 회원가입 (신규 회원)
 */

import { axiosClient } from '@/src/shared/libs/axios';
import type {
  JpSmsSendRequest,
  JpSmsSendResponse,
  JpSmsVerifyRequest,
  JpSmsVerifyResponse,
  JpLoginRequest,
  JpLoginResponse,
  JpSignupRequest,
  JpSignupResponse,
} from '../types';

/**
 * SMS 인증코드 발송
 * 개발 환경에서는 실제 SMS가 발송되지 않음
 */
export const sendJpSms = (data: JpSmsSendRequest): Promise<JpSmsSendResponse> =>
  axiosClient.post('/jp/auth/sms/send', data);

/**
 * SMS 인증코드 검증
 * 개발 환경 테스트 코드: 123456
 */
export const verifyJpSms = (data: JpSmsVerifyRequest): Promise<JpSmsVerifyResponse> =>
  axiosClient.post('/jp/auth/sms/verify', data);

/**
 * JP 로그인 (SMS 인증 완료 후)
 * isNewUser로 신규/기존 회원 판별
 */
export const jpLogin = (data: JpLoginRequest): Promise<JpLoginResponse> =>
  axiosClient.post('/jp/auth/login', data);

/**
 * JP 회원가입
 * multipart/form-data 형식으로 프로필 이미지 포함
 */
export const jpSignup = async (data: JpSignupRequest): Promise<JpSignupResponse> => {
  const formData = new FormData();

  formData.append('phoneNumber', data.phoneNumber);
  formData.append('name', data.name);
  formData.append('gender', data.gender);
  formData.append('birthday', data.birthday);
  formData.append('age', data.age.toString());
  formData.append('universityId', data.universityId);
  formData.append('departmentName', data.departmentName);
  formData.append('grade', data.grade);
  formData.append('studentNumber', data.studentNumber);

  if (data.mainImageIndex !== undefined) {
    formData.append('mainImageIndex', data.mainImageIndex.toString());
  }
  if (data.instagramId) {
    formData.append('instagramId', data.instagramId);
  }
  if (data.email) {
    formData.append('email', data.email);
  }
  if (data.referralCode) {
    formData.append('referralCode', data.referralCode);
  }

  for (const image of data.profileImages) {
    formData.append('profileImages', image);
  }

  return axiosClient.post('/jp/auth/signup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
