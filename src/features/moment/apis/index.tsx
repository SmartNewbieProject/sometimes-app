import { axiosClient } from "@/src/shared/libs";
import type { MomentSlide, MomentReportResponse } from "../types";

// =============================================
// Type Definitions (Based on OpenAPI Schema)
// =============================================

// Daily Question Types
export interface DailyQuestion {
  id: number;
  questionText: string;
  questionType: 'text' | 'choice';
  answerOptions: string[] | null;
  createdAt: string;
}

export interface DailyQuestionResponse {
  id: number;
  questionText: string;
  questionType: 'text' | 'choice';
  answerOptions: string[] | null;
  createdAt: string;
}

// Answer Types
export interface SubmitAnswerRequest {
  questionId: number;
  answerText: string;
  answerOptionId?: number;
  responseTimeSeconds: number;
}

export interface SubmitAnswerResponse {
  id: number;
  userId: number;
  questionId: number;
  answerText: string;
  answerOptionId: number | null;
  responseTimeSeconds: number;
  createdAt: string;
}

// Weekly Report Types (Updated API Schema)
export interface StatItem {
  category: string;
  currentScore: number;
  prevScore: number;
  status: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
}

export interface InsightItem {
  category: string;
  score: number;
  definition: string;
  feedback: string;
}

export interface WeeklyReport {
  id: string;                              // UUID
  userId: string;                           // 사용자 ID
  weekNumber: number;                       // 주차 번호 (1-52)
  year: number;                             // 연도
  title: string;                            // 메인 칭호
  subTitle: string;                         // 상세 설명
  generatedAt: string;                      // 생성 시간 (ISO 8601)
  stats: StatItem[];                        // 차트 데이터 배열
  insights: InsightItem[];                  // 상세 분석 배열
  keywords: string[];                        // 해시태그 배열
}

// Legacy WeeklyReport for backward compatibility
export interface LegacyWeeklyReport {
  id: number;
  userId: number;
  weekOfYear: number;
  year: number;
  totalAnswers: number;
  averageResponseTime: number;
  sentimentScore: number;
  keywords: string[];
  insights: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReportRequest {
  weekNumber: number;
  year: number;
}

// Profile Keywords & Introduction Types
export interface RecommendedKeyword {
  text: string;
  score: number;
}

export interface ProfileKeywordsResponse {
  keywords: RecommendedKeyword[];
}

export interface ProfileIntroductionResponse {
  introduction: string;
  personalityTraits: string[];
  generatedAt: string;
}

export interface SyncProfileRequest {
  syncKeywords: boolean;
  syncIntroduction: boolean;
}

export interface SyncProfileResponse {
  success: boolean;
  syncedKeywords: string[];
  syncedIntroduction: string;
  updatedAt: string;
}

// Profile Introductions Types
export interface ProfileIntroductionsRequest {
  syncKeywords?: boolean;
  syncIntroduction?: boolean;
}

export interface ProfileIntroductionsResponse {
  success: boolean;
  message?: string;
}

// History Types
export interface AnswerHistoryItem {
  id: number;
  questionId: number;
  questionText: string;
  answerText: string;
  responseTimeSeconds: number;
  createdAt: string;
}

export interface AnswerHistoryResponse {
  answers: AnswerHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StatItem {
  category: string;        // '감정 개방성', '가치 명확성', 등
  currentScore: number;    // 현재 점수
  prevScore: number;       // 이전 주 점수
  status: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
}

export interface InsightItem {
  category: string;        // 차원 이름
  score: number;          // 점수
  definition: string;     // 정의
  feedback: string;       // 피드백
}

export interface ReportHistoryItem {
  id: string;                              // UUID
  userId: string;                           // 사용자 ID
  weekNumber: number;                       // 주차 번호 (1-52)
  year: number;                             // 연도
  title: string;                            // 메인 칭호
  subTitle: string;                         // 상세 설명
  generatedAt: string;                      // 생성 시간 (ISO 8601)
  stats: StatItem[];                        // 통계 데이터
  insights: InsightItem[];                  // 인사이트 데이터
  keywords: string[];                        // 해시태그 배열
}

export interface ReportHistoryResponse {
  reports: ReportHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UserProgressStatus {
  currentWeek: {
    week: number;
    year: number;
  };
  canProceedToday: boolean;
  answeredThisWeek: number;
  blockedReason: string;
  sequenceValidation: {
    canProceed: boolean;
    reason: string;
    message: string;
    suggestedAction: string;
  };
}

export interface WeeklyProgress {
  weekOfYear: number;
  year: number;
  totalAnswers: number;
  targetAnswers: number;
  completionRate: number;
  averageResponseTime: number;
  sentimentScore: number;
}

// Admin Question Assignment Types
export interface AdminQuestionAssignmentRequest {
  userId: string;
  questionId?: string; // optional, 자동 선택 시 생략
  week?: number; // optional, 현재 주차 자동
  year?: number; // optional, 현재 연도 자동
}

export interface QuestionOption {
  id: string;
  text: string;
  order: number;
}

export interface DailyQuestionData {
  questionId: string;
  text: string;
  dimension: string;
  type: string;
  dayOfWeek: number;
  isAnswered: boolean;
  remainingQuestions: number;
  options: QuestionOption[];
}

export interface AdminQuestionAssignmentResponse {
  success: boolean;
  message: string;
  assignmentId: string;
  data: {
    userId: string;
    questionId: string;
    week: number;
    year: number;
    dayOfWeek: number;
    assignedAt: string;
  };
}

export interface AdminError {
  statusCode: number;
  message: string;
  timestamp: string;
}

// Updated Daily Question Response (matching new API spec)
export interface UpdatedDailyQuestionResponse extends DailyQuestionData { }

export interface NoQuestionResponse {
  questionId: null;
  text: null;
  dimension: null;
  type: null;
  dayOfWeek: 0;
  isAnswered: false;
  remainingQuestions: 0;
  options: [];
}

// Legacy Types (for existing functionality)
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Type aliases for backward compatibility
export type ProfileKeywords = ProfileKeywordsResponse;
export type ProfileIntroduction = ProfileIntroductionResponse;
export type AnswerHistory = AnswerHistoryResponse;
export type ReportHistory = ReportHistoryResponse;
export type ProgressStatus = UserProgressStatus;

// =============================================
// API Functions (Based on OpenAPI Endpoints)
// =============================================

// Admin Question Assignment
export const assignQuestionToUser = async (data: AdminQuestionAssignmentRequest): Promise<AdminQuestionAssignmentResponse> => {
  return axiosClient.post('/admin/moment/questions/assign', data);
};

// Daily Question (Updated API)
export const getDailyQuestion = async (): Promise<UpdatedDailyQuestionResponse | NoQuestionResponse> => {
  return axiosClient.get('/moment/daily-question');
};

// Answers
export const submitAnswer = async (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
  return axiosClient.post('/moment/answers', data);
};

// Weekly Reports
export const getWeeklyReport = async (params: WeeklyReportRequest): Promise<WeeklyReport> => {
  return axiosClient.get('/moment/reports/weekly', { params });
};

export const generateWeeklyReport = async (): Promise<WeeklyReport> => {
  return axiosClient.post('/moment/reports/generate');
};

// Profile Keywords & Introduction
export const getRecommendedKeywords = async (): Promise<ProfileKeywordsResponse> => {
  return axiosClient.get('/moment/profile/keywords');
};

export const getProfileIntroduction = async (): Promise<ProfileIntroductionResponse> => {
  return axiosClient.get('/moment/profile/introduction');
};

export const syncProfile = async (data: SyncProfileRequest): Promise<SyncProfileResponse> => {
  return axiosClient.post('/moment/profile/sync', data);
};

// Profile Introductions
export const createProfileIntroductions = async (data: ProfileIntroductionsRequest): Promise<ProfileIntroductionsResponse> => {
  return axiosClient.post('/moment/profile/introductions', data);
};

export const updateIntroductions = async (data: ProfileIntroductionsRequest): Promise<ProfileIntroductionsResponse> => {
  return axiosClient.patch('/moment/profile/introductions', data);
};

// History
export const getAnswerHistory = async (params: PaginationParams = {}): Promise<AnswerHistoryResponse> => {
  return axiosClient.get('/moment/questions/history', { params });
};

export const getReportHistory = async (params: PaginationParams = {}): Promise<ReportHistoryResponse> => {
  return axiosClient.get('/moment/reports/history', { params });
};

// Progress
export const getUserProgressStatus = async (): Promise<UserProgressStatus> => {
  return axiosClient.get('/moment/progress/status');
};

export const getWeeklyProgress = async (): Promise<WeeklyProgress> => {
  return axiosClient.get('/moment/progress/weekly');
};

// Legacy slide API
export const getMomentSlides = async (): Promise<MomentSlide[]> => {
  // TODO: 실제 API 연동
  return [];
};

// Latest Moment Report API
export const getLatestMomentReport = async (): Promise<MomentReportResponse> => {
  return axiosClient.get('/moment/latest');
};

// =============================================
// API Functions Export Only
// =============================================

// =============================================
// Utility Functions & Constants
// =============================================

// Error handler for API calls
export const handleMomentApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Query Keys Constants
export const MOMENT_QUERY_KEYS = {
  DAILY_QUESTION: ['moment', 'daily-question'],
  ADMIN_QUESTION_ASSIGNMENT: ['admin', 'moment', 'questions', 'assign'],
  WEEKLY_REPORT: (weekNumber: number, year: number) => ['moment', 'weekly-report', weekNumber, year],
  PROFILE_KEYWORDS: ['moment', 'profile-keywords'],
  PROFILE_INTRODUCTION: ['moment', 'profile-introduction'],
  PROGRESS_STATUS: ['moment', 'progress-status'],
  WEEKLY_PROGRESS: ['moment', 'weekly-progress'],
  ANSWER_HISTORY: ['moment', 'answer-history'],
  REPORT_HISTORY: ['moment', 'report-history'],
  LATEST_REPORT: ['moment', 'latest-report'],
} as const;

// Stale Time Constants
export const STALE_TIME = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 10 * 60 * 1000, // 10 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
} as const;

// Pagination Defaults
export const paginationDefaults = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 50,
} as const;

// Legacy API Service for backward compatibility
export type MomentApiService = {
  assignQuestionToUser: (data: AdminQuestionAssignmentRequest) => Promise<AdminQuestionAssignmentResponse>;
  getDailyQuestion: () => Promise<UpdatedDailyQuestionResponse | NoQuestionResponse>;
  submitAnswer: (data: SubmitAnswerRequest) => Promise<SubmitAnswerResponse>;
  getAnswerHistory: (params?: PaginationParams) => Promise<AnswerHistoryResponse>;
  getWeeklyReport: (params: WeeklyReportRequest) => Promise<WeeklyReport>;
  generateWeeklyReport: () => Promise<WeeklyReport>;
  getReportHistory: (params?: PaginationParams) => Promise<ReportHistoryResponse>;
  getRecommendedKeywords: () => Promise<ProfileKeywordsResponse>;
  getProfileIntroduction: () => Promise<ProfileIntroductionResponse>;
  syncProfile: (data: SyncProfileRequest) => Promise<SyncProfileResponse>;
  createProfileIntroductions: (data: ProfileIntroductionsRequest) => Promise<ProfileIntroductionsResponse>;
  updateIntroductions: (data: ProfileIntroductionsRequest) => Promise<ProfileIntroductionsResponse>;
  getUserProgressStatus: () => Promise<UserProgressStatus>;
  getWeeklyProgress: () => Promise<WeeklyProgress>;
  getMomentSlides: () => Promise<MomentSlide[]>;
  getLatestMomentReport: () => Promise<MomentReportResponse>;
};

// API Service Object
const momentApis: MomentApiService = {
  assignQuestionToUser,
  getDailyQuestion,
  submitAnswer,
  getAnswerHistory,
  getWeeklyReport,
  generateWeeklyReport,
  getReportHistory,
  getRecommendedKeywords,
  getProfileIntroduction,
  syncProfile,
  createProfileIntroductions,
  updateIntroductions,
  getUserProgressStatus,
  getWeeklyProgress,
  getMomentSlides,
  getLatestMomentReport,
};

export default momentApis;