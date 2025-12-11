import { axiosClient } from "@/src/shared/libs";
import type {
  MomentSlide,
  MomentReportResponse,
  DailyQuestionResponse,
  RawDailyQuestionResponse,
  QuestionHistoryResponse,
  LatestQuestionsResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  SubmitAnswerErrorResponse,
  GetAnswersResponse,
  WeeklyAnswersResponse,
  GenerateReportResponse,
  WeeklyReportResponse,
  ReportHistoryResponse,
  LatestReportResponse,
  SyncProfileRequest,
  SyncProfileResponse,
  SyncStatusResponse,
  QuestionHistoryParams,
  AnswersParams,
  WeeklyAnswersParams,
  WeeklyReportParams,
  ReportHistoryParams,
  WeekInfo,
  RawQuestion,
  Question,
} from "../types";

// Weekly Report Types (Updated API Schema)
export interface LegacyStatItem {
  category: string;
  currentScore: number;
  prevScore: number;
  status: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
}

export interface LegacyInsightItem {
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
  stats: LegacyStatItem[];                  // 차트 데이터 배열
  insights: LegacyInsightItem[];            // 상세 분석 배열
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

// History List API용 Stat/Insight 타입 (요약용)
export interface StatItem {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
}

export interface InsightItem {
  category: string;
  summary: string;
}

// 차트 시각화용 데이터 타입 (백엔드 제안 구조)
export interface ChartCategoryScores {
  emotionalOpenness: number;    // 감정 개방성
  valueClarity: number;         // 가치 명확성
  openAttitude: number;         // 열린 태도
  relationshipStability: number; // 관계 안정감
  conflictMaturity: number;     // 갈등 성숙도
}

export interface ChartData {
  averageScore: number;  // 5가지 카테고리 평균 (0-100)
  categoryScores: ChartCategoryScores;
  changeFromPrev: {
    averageScore: number;
    trend: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
  };
}

export interface ReportHistoryItem {
  id: string;                              // UUID
  userId: string;                           // 사용자 ID
  weekNumber: number;                       // 주차 번호 (1-52)
  year: number;                             // 연도
  title: string;                            // 메인 칭호
  subTitle: string;                         // 상세 설명
  generatedAt: string;                      // 생성 시간 (ISO 8601)
  stats: StatItem[];                        // 통계 데이터 (요약용)
  insights: InsightItem[];                  // 인사이트 데이터
  keywords: string[];                        // 해시태그 배열
  chartData?: ChartData;                    // 차트 시각화용 데이터 (optional - 백엔드 업데이트 후 필수)
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

// Progress Types - Updated to match server response
export interface ServerProgressStatus {
  currentWeek: {
    week: number;
    year: number;
  };
  dayOfWeek: number;
  answeredThisWeek: number;
  canProceedToday: boolean;
  remainingQuestions: number;
  currentQuestion: {
    questionId: string;
    text: string;
    dimension: string;
    type: string;
    dayOfWeek: number;
    isAnswered: boolean;
    remainingQuestions: number;
  } | null;
}

// Internal UserProgressStatus type (for component compatibility)
export interface UserProgressStatus {
  hasDailyQuestion: boolean;        // 데일리 질문 존재 여부
  hasWeeklyProgress: boolean;       // 이번 주 진행상황 여부
  hasTodayAnswer: boolean;          // 오늘 답변 여부
  canProceed: boolean;              // 답변 가능 여부
  answeredThisWeek: number;         // 이번 주 답변 수
  remainingQuestions: number;       // 남은 질문 수
  currentWeek?: {
    week: number;
    year: number;
  };
  dayOfWeek?: number;
  hasActiveSession?: boolean;       // 레거시 호환성
  currentStreak?: number;
  totalAnswers?: number;
  lastActivityDate?: string;
  lastActivity?: {
    type: string;
    timestamp: string;
  };
  completionRate?: number;
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
export interface UpdatedDailyQuestionResponse extends DailyQuestionData {}

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

// Export ServerProgressStatus for type safety
export type { ServerProgressStatus, UserProgressStatus };

// =============================================
// API Functions (Based on New API Specification)
// =============================================

// =======================
// Questions API
// =======================

// Daily Question API
export const getDailyQuestion = async (): Promise<DailyQuestionResponse> => {
  try {
    console.log('🚀 Starting getDailyQuestion...');

    // axiosClient interceptor returns response.data directly
    // API now returns data directly without {success: boolean, data: T} wrapper
    const questionData: any = await axiosClient.get('/v1/moment/questions/daily');
    console.log('📥 Question data received:', questionData);
    console.log('📥 Response type:', typeof questionData);
    console.log('📥 Response keys:', Object.keys(questionData || {}));

    // Validate response structure
    if (!questionData || typeof questionData !== 'object') {
      throw new Error('Invalid response format - not an object');
    }

    // Check if response indicates no question available
    // Handle both wrapped response { question: {...} } and direct question response
    const actualQuestion = questionData.question || questionData;
    if (!actualQuestion.questionId) {
      console.log('ℹ️ No daily question available');
      return {
        question: null,
        weekInfo: null,
      };
    }

    console.log('✅ Question data validated:', questionData);

    // Get current week info
    const now = new Date();
    const jsDay = now.getDay();
    const serverDayOfWeek = jsDay === 0 ? 0 : jsDay;

    const weekInfo: WeekInfo = {
      week: Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7),
      year: now.getFullYear(),
      dayOfWeek: serverDayOfWeek,
    };

    console.log('📅 WeekInfo calculated:', weekInfo);

    // Convert raw question to internal format (inline implementation)
    const convertRawQuestionInline = (rawQuestion: any, weekInfo: WeekInfo) => {
      // Convert dimension from lowercase to uppercase
      const dimension = rawQuestion.dimension?.toUpperCase() || 'OPENNESS';

      // Convert server type to internal enum
      // Handle both Korean "선택형" and other possible types
      let questionType: 'single_choice' = 'single_choice';

      if (rawQuestion.type === '선택형' || rawQuestion.type === 'single_choice' || rawQuestion.type === '선택지') {
        questionType = 'single_choice';
      } else if (rawQuestion.type === '주관식' || rawQuestion.type === 'text' || rawQuestion.type === '텍스트') {
        // Future: support text input questions
        questionType = 'single_choice'; // For now, default to single choice
      }

      console.log('🔄 Question type conversion:', {
        serverType: rawQuestion.type,
        internalType: questionType,
        hasOptions: !!rawQuestion.options && rawQuestion.options.length > 0,
      });

      return {
        id: rawQuestion.questionId,
        text: rawQuestion.text,
        dimension: dimension,
        type: questionType,
        options: rawQuestion.options || [],
        dayOfWeek: rawQuestion.dayOfWeek,
        week: weekInfo.week,
        year: weekInfo.year,
      };
    };

    const question = convertRawQuestionInline(actualQuestion, weekInfo);
    console.log('🔄 Converted Question:', question);

    return {
      question,
      weekInfo,
    };
  } catch (error) {
    console.error('💥 getDailyQuestion failed:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

// Question History API
export const getQuestionHistory = async (params: QuestionHistoryParams): Promise<QuestionHistoryResponse> => {
  return axiosClient.get('/v1/moment/questions/history', { params });
};

// Latest Questions API
export const getLatestQuestions = async (): Promise<LatestQuestionsResponse> => {
  return axiosClient.get('/v1/moment/questions/latest');
};

// =======================
// Answers API
// =======================

// Submit Answer API
export const submitAnswer = async (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
  console.log('🚀 submitAnswer called with:', data);

  try {
    // API now returns data directly without wrapper
    const response = await axiosClient.post('/v1/moment/answers', data);
    console.log('✅ Answer submitted successfully:', response);

    // API returns { id: "new-answer-uuid" }
    return response;
  } catch (error) {
    console.error('❌ submitAnswer failed:', error);

    // Check if it's a structured error response from the API
    if (error.response?.data?.error) {
      const errorData = error.response.data;
      console.log('🚫 API returned structured error:', errorData);

      // Create a more descriptive error with the API's structured information
      const enhancedError = new Error(errorData.message || '답변 제출에 실패했습니다');
      enhancedError.name = 'SubmitAnswerError';
      enhancedError.blockedReason = errorData.blockedReason;
      enhancedError.suggestedAction = errorData.suggestedAction;
      enhancedError.originalError = error;

      throw enhancedError;
    }

    // For other types of errors, re-throw as-is
    throw error;
  }
};

// Get Answers API
export const getAnswers = async (params: AnswersParams): Promise<GetAnswersResponse> => {
  return axiosClient.get('/v1/moment/answers', { params });
};

// Weekly Answers API
export const getWeeklyAnswers = async (params: WeeklyAnswersParams): Promise<WeeklyAnswersResponse> => {
  return axiosClient.get('/v1/moment/answers/weekly', { params });
};

// =======================
// Reports API
// =======================

// Generate Report API
export const generateReport = async (): Promise<GenerateReportResponse> => {
  return axiosClient.post('/v1/moment/reports/generate');
};

// Get Weekly Report API
export const getWeeklyReport = async (params: WeeklyReportParams): Promise<WeeklyReportResponse> => {
  console.log('🚀 getWeeklyReport called with params:', params);

  try {
    // API now returns data directly without {success: boolean, data: T} wrapper
    const response = await axiosClient.get('/v1/moment/reports/weekly', { params });
    console.log('📥 Weekly Report Response:', response);

    // Handle the case where API returns { reports: [...] } structure
    if (response && response.reports) {
      console.log('✅ Reports array structure detected');
      return response; // Return as-is since UI expects this structure
    }

    // Handle the case where API returns a single report object
    if (response && typeof response === 'object') {
      console.log('✅ Single report structure detected, wrapping in reports array');
      return { reports: [response] };
    }

    // Handle empty or invalid response
    console.log('⚠️ No valid report data found');
    return { reports: [] };

  } catch (error) {
    console.error('💥 getWeeklyReport failed:', error);
    throw error;
  }
};

// Report History API
export const getReportHistory = async (params: ReportHistoryParams): Promise<ReportHistoryResponse> => {
  console.log('🚀 getReportHistory called with params:', params);

  try {
    // API now returns data directly without {success: boolean, data: T} wrapper
    const response = await axiosClient.get('/v1/moment/reports/history', { params });
    console.log('📥 Report History Response:', response);
    console.log('📥 Response type:', typeof response);
    console.log('📥 Response keys:', Object.keys(response || {}));

    // Validate the response structure
    if (!response || typeof response !== 'object') {
      console.error('❌ Invalid response format - not an object');
      return { reports: [] };
    }

    // Handle reports array response
    if (response.reports && Array.isArray(response.reports)) {
      console.log('✅ Reports array structure detected');
      return response;
    }

    // Handle case where API returns just the reports array
    if (Array.isArray(response)) {
      console.log('✅ Direct reports array detected');
      return { reports: response };
    }

    // Handle empty response
    console.log('ℹ️ No reports found in response');
    return { reports: [] };

  } catch (error) {
    console.error('💥 getReportHistory failed:', error);
    console.error('Error message:', error.message);

    // Return safe fallback on error
    return { reports: [] };
  }
};

// Latest Report API
export const getLatestReport = async (): Promise<LatestReportResponse> => {
  console.log('🚀 getLatestReport API call starting...');
  try {
    const response = await axiosClient.get('/v1/moment/reports/latest');
    console.log('✅ getLatestReport API response:', response);
    return response;
  } catch (error) {
    console.error('❌ getLatestReport API error:', error);
    throw error;
  }
};

// =======================
// Profile API
// =======================

// Sync Profile API
export const syncProfile = async (data: SyncProfileRequest): Promise<SyncProfileResponse> => {
  return axiosClient.post('/v1/moment/profile/sync', data);
};

// Sync Status API
export const getSyncStatus = async (profileId: string): Promise<SyncStatusResponse> => {
  return axiosClient.get(`/v1/moment/profile/status/${profileId}`);
};

// =======================
// Admin API (for administrative functions)
// =======================

// Admin Question Assignment
export const assignQuestionToUser = async (data: any): Promise<any> => {
  return axiosClient.post('/v1/admin/moment/questions/assign', data);
};

// =======================
// Legacy APIs (for backward compatibility)
// =======================

// These functions will be deprecated in favor of new API spec
// Legacy slide API
export const getMomentSlides = async (): Promise<MomentSlide[]> => {
  // TODO: 실제 API 연동
  return [];
};

// Latest Moment Report API (legacy - redirected to new API)
export const getLatestMomentReport = async (): Promise<MomentReportResponse> => {
  try {
    // Try to use the new API endpoint - API now returns data directly
    const reportData = await axiosClient.get('/v1/moment/reports/latest');
    console.log('📥 Latest Moment Report Response:', reportData);

    // Transform new API response to legacy format for backward compatibility
    return {
      success: true,
      message: 'Latest report retrieved successfully',
      data: reportData, // API now returns data directly
    };
  } catch (error) {
    console.error('💥 getLatestMomentReport failed:', error);
    // If new API fails, return empty response for now
    // This prevents the query from failing completely
    return {
      success: true,
      message: 'No latest report available',
      data: null,
    };
  }
};

// Legacy Answer History API (for backward compatibility)
export const getAnswerHistory = async (params: any = {}): Promise<any> => {
  return axiosClient.get('/moment/questions/history', { params });
};

// Legacy Weekly Report Generation (for backward compatibility)
export const generateWeeklyReport = async (): Promise<any> => {
  return axiosClient.post('/moment/reports/generate');
};

// Legacy Profile APIs (for backward compatibility)
export const getRecommendedKeywords = async (): Promise<any> => {
  return axiosClient.get('/moment/profile/keywords');
};

export const getProfileIntroduction = async (): Promise<any> => {
  return axiosClient.get('/moment/profile/introduction');
};

export const getUserProgressStatus = async (): Promise<UserProgressStatus> => {
  const serverResponse: ServerProgressStatus = await axiosClient.get('/moment/progress/status');

  // canProceedToday가 false이고 currentQuestion이 없으면 오늘 이미 답변 완료한 상태
  const hasTodayAnswer = serverResponse.currentQuestion?.isAnswered
    || (!serverResponse.canProceedToday && !serverResponse.currentQuestion);

  return {
    hasDailyQuestion: !!serverResponse.currentQuestion,
    hasWeeklyProgress: serverResponse.answeredThisWeek > 0,
    hasTodayAnswer,
    canProceed: serverResponse.canProceedToday,
    answeredThisWeek: serverResponse.answeredThisWeek,
    remainingQuestions: serverResponse.remainingQuestions,
    currentWeek: serverResponse.currentWeek,
    dayOfWeek: serverResponse.dayOfWeek,
  };
};

export const getWeeklyProgress = async (): Promise<any> => {
  return axiosClient.get('/moment/progress/weekly');
};

// Legacy Profile Introductions
export const createProfileIntroductions = async (data: any): Promise<any> => {
  return axiosClient.post('/moment/profile/introductions', data);
};

export const updateIntroductions = async (data: any): Promise<any> => {
  return axiosClient.patch('/moment/profile/introductions', data);
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

// Updated Query Keys Constants (New API Spec)
export const MOMENT_QUERY_KEYS = {
  // Questions API
  DAILY_QUESTION: ['moment', 'questions', 'daily'],
  QUESTION_HISTORY: ['moment', 'questions', 'history'],
  LATEST_QUESTIONS: ['moment', 'questions', 'latest'],

  // Answers API
  ANSWERS: ['moment', 'answers'],
  WEEKLY_ANSWERS: (week: number, year: number) => ['moment', 'answers', 'weekly', week, year],

  // Reports API
  REPORTS: ['moment', 'reports'],
  WEEKLY_REPORT: (week: number, year: number) => ['moment', 'reports', 'weekly', week, year],
  REPORT_HISTORY: ['moment', 'reports', 'history'],
  LATEST_REPORT: ['moment', 'reports', 'latest'],

  // Profile API
  PROFILE: ['moment', 'profile'],
  SYNC_STATUS: (profileId: string) => ['moment', 'profile', 'status', profileId],

  // Legacy Keys (for backward compatibility)
  PROFILE_KEYWORDS: ['moment', 'profile-keywords'],
  PROFILE_INTRODUCTION: ['moment', 'profile-introduction'],
  PROGRESS_STATUS: ['moment', 'progress-status'],
  WEEKLY_PROGRESS: ['moment', 'weekly-progress'],
  ANSWER_HISTORY: ['moment', 'answer-history'],
  LATEST_REPORT_LEGACY: ['moment', 'latest-report'],
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
  getLatestReport: () => Promise<LatestReportResponse>;
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
  getLatestReport,
};

export default momentApis;