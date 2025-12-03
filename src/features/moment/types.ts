import { z } from 'zod';

// =======================
// Questions API 타입
// =======================

// Raw API response types (matching server response)
export const RawPersonalityDimension = z.enum([
  'extraversion',
  'openness',
  'conscientiousness',
  'agreeableness',
  'neuroticism'
]);

export type RawPersonalityDimension = z.infer<typeof RawPersonalityDimension>;

// Internal processed types (converting to uppercase for consistency)
export const PersonalityDimension = z.enum([
  'EXTRAVERSION',
  'OPENNESS',
  'CONSCIENTIOUSNESS',
  'AGREEABLENESS',
  'NEUROTICISM'
]);

export type PersonalityDimension = z.infer<typeof PersonalityDimension>;

// Helper function to convert raw dimension to internal format
export const convertRawDimension = (rawDimension: RawPersonalityDimension): PersonalityDimension => {
  return rawDimension.toUpperCase() as PersonalityDimension;
};

export const QuestionType = z.enum(['single_choice']);

export type QuestionType = z.infer<typeof QuestionType>;

export const QuestionOption = z.object({
  id: z.string(),
  text: z.string(),
});

export type QuestionOption = z.infer<typeof QuestionOption>;

// Raw question type matching server response
export const RawQuestion = z.object({
  questionId: z.string(),
  text: z.string(),
  dimension: RawPersonalityDimension,
  type: z.string(), // Server returns "선택형" instead of "single_choice"
  options: z.array(QuestionOption),
  dayOfWeek: z.number(),
  isAnswered: z.boolean(),
  remainingQuestions: z.number(),
});

export type RawQuestion = z.infer<typeof RawQuestion>;

// Processed question type for internal use
export const Question = z.object({
  id: z.string(),
  text: z.string(),
  dimension: PersonalityDimension,
  type: QuestionType,
  options: z.array(QuestionOption),
  dayOfWeek: z.number(),
  week: z.number(),
  year: z.number(),
});

export type Question = z.infer<typeof Question>;

// Helper function to convert raw question to internal format
export const convertRawQuestion = (rawQuestion: RawQuestion, weekInfo: WeekInfo): Question => {
  // Convert server type to internal enum
  // Handle both Korean "선택형" and other possible types
  let questionType: 'single_choice' = 'single_choice';

  if (rawQuestion.type === '선택형' || rawQuestion.type === 'single_choice' || rawQuestion.type === '선택지') {
    questionType = 'single_choice';
  } else if (rawQuestion.type === '주관식' || rawQuestion.type === 'text' || rawQuestion.type === '텍스트') {
    // Future: support text input questions
    questionType = 'single_choice'; // For now, default to single choice
  }

  return {
    id: rawQuestion.questionId,
    text: rawQuestion.text,
    dimension: convertRawDimension(rawQuestion.dimension),
    type: questionType, // Dynamic type conversion
    options: rawQuestion.options,
    dayOfWeek: rawQuestion.dayOfWeek,
    week: weekInfo.week,
    year: weekInfo.year,
  };
};

export const WeekInfo = z.object({
  week: z.number(),
  year: z.number(),
  dayOfWeek: z.number(),
});

export type WeekInfo = z.infer<typeof WeekInfo>;

// Raw daily question response matching server API structure
export const RawDailyQuestionResponse = z.object({
  success: z.boolean(),
  data: RawQuestion,
  timestamp: z.string(),
  requestId: z.string(),
});

export type RawDailyQuestionResponse = z.infer<typeof RawDailyQuestionResponse>;

// Processed daily question response for internal use
export const DailyQuestionResponse = z.object({
  question: Question,
  weekInfo: WeekInfo,
});

export type DailyQuestionResponse = z.infer<typeof DailyQuestionResponse>;

export const QuestionHistoryResponse = z.object({
  questions: z.array(Question),
});

export type QuestionHistoryResponse = z.infer<typeof QuestionHistoryResponse>;

export const LatestQuestionsResponse = z.object({
  questions: z.array(Question),
});

export type LatestQuestionsResponse = z.infer<typeof LatestQuestionsResponse>;

// =======================
// Answers API 타입
// =======================

export const SubmitAnswerRequest = z.object({
  questionId: z.string(),
  answerText: z.string().optional(),
  answerOptionId: z.string().optional(),
  responseTimeSeconds: z.number(),
}).refine((data) => data.answerText || data.answerOptionId, {
  message: 'answerText 또는 answerOptionId 중 하나는 필수입니다',
});

export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequest>;

export const Answer = z.object({
  id: z.string(),
  userId: z.string(),
  questionId: z.string(),
  answerText: z.string().optional(),
  answerOptionId: z.string().optional(),
  responseTimeSeconds: z.number(),
  answeredAt: z.string(),
  sequenceNumber: z.number(),
});

export type Answer = z.infer<typeof Answer>;

// 새로운 API 응답 타입 (성공)
export const SubmitAnswerResponse = z.object({
  id: z.string(),
});

export type SubmitAnswerResponse = z.infer<typeof SubmitAnswerResponse>;

// API 에러 응답 타입
export const SubmitAnswerErrorResponse = z.object({
  error: z.boolean(),
  message: z.string(),
  blockedReason: z.string().optional(),
  suggestedAction: z.string().optional(),
});

export type SubmitAnswerErrorResponse = z.infer<typeof SubmitAnswerErrorResponse>;

export const GetAnswersResponse = z.object({
  answers: z.array(Answer),
});

export type GetAnswersResponse = z.infer<typeof GetAnswersResponse>;

export const WeeklyAnswersResponse = z.object({
  answers: z.array(Answer),
});

export type WeeklyAnswersResponse = z.infer<typeof WeeklyAnswersResponse>;

// =======================
// Reports API 타입
// =======================

export const ReportStatus = z.enum(['in_progress', 'completed', 'failed']);

export type ReportStatus = z.infer<typeof ReportStatus>;

export const GenerateReportResponse = z.object({
  reportId: z.string(),
  week: z.number(),
  year: z.number(),
  status: ReportStatus,
});

export type GenerateReportResponse = z.infer<typeof GenerateReportResponse>;

export const DimensionScores = z.record(PersonalityDimension, z.number());

export type DimensionScores = z.infer<typeof DimensionScores>;

export const ReportStatistics = z.object({
  totalAnswers: z.number(),
  averageResponseTime: z.number(),
  completionRate: z.number(),
  dimensions: DimensionScores,
});

export type ReportStatistics = z.infer<typeof ReportStatistics>;

export const ReportNarrative = z.object({
  title: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  insights: z.array(z.string()),
});

export type ReportNarrative = z.infer<typeof ReportNarrative>;

export const Report = z.object({
  id: z.string(),
  userId: z.string(),
  week: z.number(),
  year: z.number(),
  narrative: ReportNarrative,
  statistics: ReportStatistics,
  generatedAt: z.string(),
});

export type Report = z.infer<typeof Report>;

export const WeeklyReportResponse = z.object({
  success: z.boolean(),
  data: Report,
  timestamp: z.string().optional(),
  requestId: z.string().optional(),
});

export type WeeklyReportResponse = z.infer<typeof WeeklyReportResponse>;

export const ReportHistoryResponse = z.object({
  reports: z.array(Report),
});

export type ReportHistoryResponse = z.infer<typeof ReportHistoryResponse>;

// 새로운 API 스펙에 맞는 최신 리포트 응답 타입
export const RadarDataItem = z.object({
  color: z.string(),
  value: z.number(),
  fullMark: z.number(),
  dimension: z.string(),
  percentile: z.number(),
});

export type RadarDataItem = z.infer<typeof RadarDataItem>;

export const UserTitle = z.object({
  title: z.string(),
  subTitle: z.string(),
  imageUrl: z.string().optional(),
  generatedAt: z.string(),
});

export type UserTitle = z.infer<typeof UserTitle>;

export const LatestReport = z.object({
  id: z.string(),
  userId: z.string(),
  week: z.number(),
  year: z.number(),
  totalAnswers: z.number(),
  dimensionScores: z.record(z.string(), z.number()),
  insights: z.array(z.string()),
  keywords: z.array(z.string()),
  radarData: z.array(RadarDataItem),
  characterAnalysis: z.object({
    persona: z.string()
  }).optional(),
  persona: z.string(),
  summaryText: z.string(),
  userTitles: z.array(UserTitle),
  dominantDimension: z.string(),
  growthAreas: z.array(z.string()),
  reportType: z.string(),
  migrationStatus: z.string(),
  reportStatus: z.string(),
  aiModelVersion: z.string(),
  generationError: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export type LatestReport = z.infer<typeof LatestReport>;

export const LatestReportResponse = LatestReport;

// 에러 응답 타입
export const LatestReportErrorResponse = z.object({
  success: z.literal(false),
  message: z.string(),
  data: z.literal(null),
});

export type LatestReportErrorResponse = z.infer<typeof LatestReportErrorResponse>;

// =======================
// Profile API 타입
// =======================

export const SyncProfileRequest = z.object({
  mbti: z.string(),
  hobbies: z.array(z.string()),
  interests: z.array(z.string()),
  introduction: z.string(),
});

export type SyncProfileRequest = z.infer<typeof SyncProfileRequest>;

export const Profile = z.object({
  userId: z.string(),
  syncStatus: z.enum(['completed', 'pending', 'failed']),
  lastSyncAt: z.string(),
  embeddingsGenerated: z.boolean(),
  updatedFields: z.array(z.string()),
});

export type Profile = z.infer<typeof Profile>;

export const SyncProfileResponse = z.object({
  profile: Profile,
});

export type SyncProfileResponse = z.infer<typeof SyncProfileResponse>;

export const SyncStatusResponse = z.object({
  status: z.string(),
  lastSyncAt: z.string(),
  pendingFields: z.array(z.string()),
});

export type SyncStatusResponse = z.infer<typeof SyncStatusResponse>;

// =======================
// 공용 타입
// =======================

export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type ApiError = z.infer<typeof ApiError>;

export const ApiResponse = <T = any>(data: z.Schema<T>) => z.object({
  success: z.boolean(),
  data: data.optional(),
  error: ApiError.optional(),
  message: z.string().optional(),
});

export type ApiResponse<T = any> = z.infer<ReturnType<ApiResponse<T>>>;

// =======================
// Query Parameters 타입
// =======================

export const PaginationParams = z.object({
  limit: z.number().min(1).max(100),
  offset: z.number().min(0),
});

export type PaginationParams = z.infer<typeof PaginationParams>;

export const ReportParams = z.object({
  week: z.number().min(1).max(53),
  year: z.number().min(2024),
});

export type ReportParams = z.infer<typeof ReportParams>;

export const QuestionHistoryParams = PaginationParams;

export type QuestionHistoryParams = z.infer<typeof QuestionHistoryParams>;

export const AnswersParams = PaginationParams;

export type AnswersParams = z.infer<typeof AnswersParams>;

export const WeeklyAnswersParams = ReportParams;

export type WeeklyAnswersParams = z.infer<typeof WeeklyAnswersParams>;

export const WeeklyReportParams = ReportParams;

export type WeeklyReportParams = z.infer<typeof WeeklyReportParams>;

export const ReportHistoryParams = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
});

export type ReportHistoryParams = z.infer<typeof ReportHistoryParams>;

// =======================
// UI 컴포넌트용 Props 타입 (기존 호환성 유지)
// =======================

export interface MomentSlide {
  id: string;
  imageUrl: string | number;
  imageType: 'local' | 'remote';
  title?: string;
  link?: string;
  externalLink?: string;
  order?: number;
}

export interface MomentSlidesProps {
  items: MomentSlide[];
  autoPlayInterval?: number;
  height: number;
}

export interface MomentNavigationItem {
  id: string;
  titleComponent: React.ReactNode;
  description: string;
  backgroundImageUrl?: string | number;
  imageSize?: number;
  isReady?: boolean;
  disabledText?: string;
  disabledMessage?: string;
  onPress: () => void;
  width?: number;
}

export type MomentNavigationHeight = 'lg' | 'md';

export interface MomentNavigationProps {
  items: MomentNavigationItem[];
  itemHeight: MomentNavigationHeight;
  itemsPerRow: number;
}

export interface MomentReport {
  id: string;
  weekNumber: number;
  year: number;
  keywords: string[];
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string;
  generatedAt: string;
}

export interface MomentReportResponse {
  success: boolean;
  message: string;
  data: MomentReport | null;
}