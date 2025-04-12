import { z } from 'zod';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$/;

export const accountSchema = z.object({
  email: z.string().email({ message: '올바른 이메일을 입력해주세요.' }),
  password: z.string().regex(passwordRegex, { message: '영문, 숫자, 특수문자 조합 8자리 이상을 입력해주세요.' }),
  passwordConfirm: z.string().regex(passwordRegex, { message: '영문, 숫자, 특수문자 조합 8자리 이상을 입력해주세요.' }),
});
