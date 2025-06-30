import { z } from 'zod';
import { dayUtils } from '@shared/libs';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$/;

export const accountSchema = z.object({
  email: z.string({ required_error: '이메일을 입력해주세요.' }).email({ message: '올바른 이메일을 입력해주세요.' }),
  password: z.string({ required_error: '비밀번호를 입력해주세요.' }).regex(passwordRegex, { message: '영문, 숫자, 특수문자 조합 8자리 이상을 입력해주세요.' }),
  passwordConfirm: z.string({ required_error: '비밀번호 확인을 입력해주세요.' }).regex(passwordRegex, { message: '영문, 숫자, 특수문자 조합 8자리 이상을 입력해주세요.' }),
});

export const phoneSchema = z.object({
  phoneNumber: z.string({ required_error: '휴대폰 번호를 입력해주세요.' }).min(11, { message: '올바른 휴대폰 번호를 입력해주세요.' }),
  authorizationCode: z.string({ required_error: '인증번호를 입력해주세요.' }).min(6, { message: '올바른 인증번호를 입력해주세요.' }),
});


export const profileSchema = z.object({
  name: z.string({ required_error: '이름을 입력해주세요' }).min(1, { message: '이름을 입력해주세요' }),
  birthday: z.string({ required_error: '생년월일을 입력해주세요' })
    .min(6, { message: '생년월일 6자리' })
    .max(6, { message: '생년월일 6자리' })
    .regex(/^\d+$/, { message: '숫자만 입력해주세요' })
    .superRefine((val, ctx) => {
      try {
        if (val.length === 6) {
          dayUtils.getDayBy6Digit(val);
        }
      } catch (error) {
        console.log('Validation error:', error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '날짜가 존재하지 않습니다.',
        });
        return false;
      }
      return true;
    }),
  gender: z.enum(['MALE', 'FEMALE'] as const, { required_error: '성별을 선택해주세요' }),
  mbti: z.string({ required_error: 'MBTI를 선택해주세요' }).min(4, { message: 'MBTI를 선택해주세요' }),
});