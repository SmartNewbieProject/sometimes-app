import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  SyncProfileRequest,
  SubmitAnswerRequest,
  QuestionHistoryParams,
  AnswersParams,
  WeeklyAnswersParams,
  WeeklyReportParams,
  ReportHistoryParams,
} from '../types';

// =======================
// Form Validation Schemas
// =======================

// Submit Answer Form Schema
export const SubmitAnswerFormSchema = z.object({
  questionId: z.string().min(1, '질문 ID는 필수입니다'),
  answerText: z.string().optional(),
  answerOptionId: z.string().optional(),
  responseTimeSeconds: z.number().min(1, '응답 시간은 1초 이상이어야 합니다').max(3600, '응답 시간은 1시간을 초과할 수 없습니다'),
}).refine((data) => data.answerText || data.answerOptionId, {
  message: "답변_텍스트_또는_선택지_중_하나는_필수입니다",
  path: ['answerText'],
});

// Sync Profile Form Schema
export const SyncProfileFormSchema = z.object({
  mbti: z.string()
    .regex(/^[IE][SN][TF][JP]$/i, '유효한 MBTI 형식이어야 합니다 (예: ENFP, ISTJ)')
    .transform(val => val.toUpperCase()),
  hobbies: z.array(z.string().min(1, '취미는 최소 1자 이상이어야 합니다'))
    .min(1, "최소_하나의_취미를_입력해주세요")
    .max(10, '취미는 최대 10개까지 입력 가능합니다'),
  interests: z.array(z.string().min(1, '관심사는 최소 1자 이상이어야 합니다'))
    .min(1, "최소_하나의_관심사를_입력해주세요")
    .max(10, '관심사는 최대 10개까지 입력 가능합니다'),
  introduction: z.string()
    .min(10, '자기소개는 최소 10자 이상이어야 합니다')
    .max(500, '자기소개는 최대 500자까지 가능합니다'),
});

// =======================
// API Parameter Validation Schemas
// =======================

// Question History Parameters
export const QuestionHistoryParamsSchema = z.object({
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().min(0),
});

// Answers Parameters
export const AnswersParamsSchema = z.object({
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().min(0),
});

// Weekly Answers Parameters
export const WeeklyAnswersParamsSchema = z.object({
  week: z.number().int().min(1).max(53),
  year: z.number().int().min(2024).max(2100),
});

// Weekly Report Parameters
export const WeeklyReportParamsSchema = z.object({
  week: z.number().int().min(1).max(53),
  year: z.number().int().min(2024).max(2100),
});

// Report History Parameters
export const ReportHistoryParamsSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

// =======================
// UI Form Component Schemas
// =======================

// Quick Answer Form (for single choice questions)
export const QuickAnswerFormSchema = z.object({
  selectedOptionId: z.string().min(1, "옵션을_선택해주세요"),
});

// Text Answer Form (for text input questions)
export const TextAnswerFormSchema = z.object({
  answerText: z.string().min(1, "답변을_입력해주세요").max(1000, '답변은 최대 1000자까지 가능합니다'),
  responseTimeSeconds: z.number().default(0),
});

// Profile Edit Form
export const ProfileEditFormSchema = z.object({
  mbti: z.string()
    .regex(/^[IE][SN][TF][JP]$/i, '유효한 MBTI 형식이어야 합니다')
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val?.toUpperCase())
    .optional(),
  hobbies: z.array(z.string().min(1)).max(10).optional(),
  interests: z.array(z.string().min(1)).max(10).optional(),
  introduction: z.string().max(500).optional(),
});

// =======================
// Type Guards and Validators
// =======================

export const isValidSubmitAnswerRequest = (data: unknown): data is SubmitAnswerRequest => {
  return SubmitAnswerFormSchema.safeParse(data).success;
};

export const isValidSyncProfileRequest = (data: unknown): data is SyncProfileRequest => {
  return SyncProfileFormSchema.safeParse(data).success;
};

export const isValidQuestionHistoryParams = (params: unknown): params is QuestionHistoryParams => {
  return QuestionHistoryParamsSchema.safeParse(params).success;
};

export const isValidAnswersParams = (params: unknown): params is AnswersParams => {
  return AnswersParamsSchema.safeParse(params).success;
};

export const isValidWeeklyAnswersParams = (params: unknown): params is WeeklyAnswersParams => {
  return WeeklyAnswersParamsSchema.safeParse(params).success;
};

export const isValidWeeklyReportParams = (params: unknown): params is WeeklyReportParams => {
  return WeeklyReportParamsSchema.safeParse(params).success;
};

export const isValidReportHistoryParams = (params: unknown): params is ReportHistoryParams => {
  return ReportHistoryParamsSchema.safeParse(params).success;
};

// =======================
// Error Messages
// =======================

export const FORM_ERROR_MESSAGES = {
  REQUIRED: "이_필드는_필수입니다",
  INVALID_EMAIL: "유효한_이메일_주소를_입력해주세요",
  INVALID_MBTI: '유효한 MBTI 형식이어야 합니다 (예: ENFP, ISTJ)',
  MIN_LENGTH: (min: number) => `최소 ${min}자 이상 입력해주세요`,
  MAX_LENGTH: (max: number) => `최대 ${max}자까지 입력 가능합니다`,
  MIN_ARRAY_LENGTH: (min: number) => `최소 ${min}개 이상 선택해주세요`,
  MAX_ARRAY_LENGTH: (max: number) => `최대 ${max}개까지 선택 가능합니다`,
  INVALID_NUMBER: "유효한_숫자를_입력해주세요",
  INVALID_DATE: "유효한_날짜를_선택해주세요",
  AT_LEAST_ONE_OPTION: "최소_하나의_옵션을_선택해주세요",
} as const;

// =======================
// Utility Functions
// =======================

export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

export const validateAndSanitizeSyncProfile = (data: unknown): SyncProfileRequest | null => {
  try {
    const sanitized = SyncProfileFormSchema.parse(data);

    // Sanitize string fields
    return {
      ...sanitized,
      hobbies: sanitized.hobbies.map(sanitizeText),
      interests: sanitized.interests.map(sanitizeText),
      introduction: sanitizeText(sanitized.introduction),
    };
  } catch (error) {
    console.error('Sync profile validation error:', error);
    return null;
  }
};

export const createDefaultFormValues = (): Partial<SyncProfileRequest> => ({
  mbti: '',
  hobbies: [],
  interests: [],
  introduction: '',
});

// =======================
// React Hook Form Configuration
// =======================

export const FORM_CONFIG = {
  SUBMIT_ANSWER: {
    mode: 'onSubmit' as const,
    reValidateMode: 'onChange' as const,
    shouldFocusError: true,
    shouldUnregister: false,
    criteriaMode: 'all' as const,
  },
  SYNC_PROFILE: {
    mode: 'onChange' as const,
    reValidateMode: 'onChange' as const,
    shouldFocusError: true,
    shouldUnregister: false,
    criteriaMode: 'all' as const,
  },
  QUICK_ANSWER: {
    mode: 'onChange' as const,
    reValidateMode: 'onChange' as const,
    shouldFocusError: true,
    shouldUnregister: true,
    criteriaMode: 'firstError' as const,
  },
} as const;

// =======================
// Export Types
// =======================

export type SubmitAnswerFormData = z.infer<typeof SubmitAnswerFormSchema>;
export type SyncProfileFormData = z.infer<typeof SyncProfileFormSchema>;
export type QuickAnswerFormData = z.infer<typeof QuickAnswerFormSchema>;
export type TextAnswerFormData = z.infer<typeof TextAnswerFormSchema>;
export type ProfileEditFormData = z.infer<typeof ProfileEditFormSchema>;

export type ValidatedSubmitAnswerRequest = z.infer<typeof SubmitAnswerFormSchema>;
export type ValidatedSyncProfileRequest = z.infer<typeof SyncProfileFormSchema>;