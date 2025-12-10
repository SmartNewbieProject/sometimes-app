import { z } from 'zod';
import { dayUtils } from '@shared/libs';
import i18n from '@/src/shared/libs/i18n'; // Assuming this path or global i18n

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$/;

export const accountSchema = z.object({
  email: z.string({ required_error: i18n.t('features.signup.ui.validation.email_required') }).email({ message: i18n.t('features.signup.ui.validation.email_invalid') }),
  password: z.string({ required_error: i18n.t('features.signup.ui.validation.password_required') }).regex(passwordRegex, { message: i18n.t('features.signup.ui.validation.password_invalid') }),
  passwordConfirm: z.string({ required_error: i18n.t('features.signup.ui.validation.password_confirm_required') }).regex(passwordRegex, { message: i18n.t('features.signup.ui.validation.password_invalid') }),
});

export const phoneSchema = z.object({
  phoneNumber: z.string({ required_error: i18n.t('features.signup.ui.validation.phone_required') }).min(11, { message: i18n.t('features.signup.ui.validation.phone_invalid') }),
  authorizationCode: z.string({ required_error: i18n.t('features.signup.ui.validation.auth_code_required') }).min(6, { message: i18n.t('features.signup.ui.validation.auth_code_invalid') }),
});


export const profileSchema = z.object({
  name: z.string({ required_error: i18n.t('features.signup.ui.validation.name_required') }).min(1, { message: i18n.t('features.signup.ui.validation.name_required') }),
  birthday: z.string({ required_error: i18n.t('features.signup.ui.validation.birthday_required') })
    .min(6, { message: i18n.t('features.signup.ui.validation.birthday_length') })
    .max(6, { message: i18n.t('features.signup.ui.validation.birthday_length') })
    .regex(/^\d+$/, { message: i18n.t('features.signup.ui.validation.birthday_numeric') })
    .superRefine((val, ctx) => {
      try {
        if (val.length === 6) {
          dayUtils.getDayBy6Digit(val);
        }
      } catch (error) {
        console.log('Validation error:', error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('features.signup.ui.validation.birthday_invalid_date'),
        });
        return false;
      }
      return true;
    }),
  gender: z.enum(['MALE', 'FEMALE'] as const, { required_error: i18n.t('features.signup.ui.validation.gender_required') }),
  mbti: z.string({ required_error: i18n.t('features.signup.ui.validation.mbti_required') }).min(4, { message: i18n.t('features.signup.ui.validation.mbti_required') }),
});
