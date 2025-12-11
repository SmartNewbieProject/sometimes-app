// =============================================
// Moment Feature - Main Exports
// =============================================

// Types
export type {
  // Questions API
  DailyQuestionResponse,
  Question,
  QuestionOption,
  QuestionType,
  PersonalityDimension,
  WeekInfo,
  QuestionHistoryResponse,
  LatestQuestionsResponse,
  QuestionHistoryParams,

  // Answers API
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  Answer,
  GetAnswersResponse,
  WeeklyAnswersResponse,
  AnswersParams,
  WeeklyAnswersParams,

  // Reports API
  GenerateReportResponse,
  Report,
  ReportStatistics,
  ReportNarrative,
  DimensionScores,
  WeeklyReportResponse,
  WeeklyReportParams,
  ReportHistoryResponse,
  ReportHistoryParams,
  LatestReportResponse,

  // Profile API
  SyncProfileRequest,
  SyncProfileResponse,
  Profile,
  SyncStatusResponse,

  // UI Props (for backward compatibility)
  MomentSlide,
  MomentSlidesProps,
  MomentNavigationItem,
  MomentNavigationHeight,
  MomentNavigationProps,
  MomentReport,
  MomentReportResponse,
} from './types';

// Schemas
export {
  SubmitAnswerFormSchema,
  SyncProfileFormSchema,
  QuickAnswerFormSchema,
  TextAnswerFormSchema,
  ProfileEditFormSchema,
  QuestionHistoryParamsSchema,
  AnswersParamsSchema,
  WeeklyAnswersParamsSchema,
  WeeklyReportParamsSchema,
  ReportHistoryParamsSchema,
  FORM_ERROR_MESSAGES,
  FORM_CONFIG,
  type SubmitAnswerFormData,
  type SyncProfileFormData,
  type QuickAnswerFormData,
  type TextAnswerFormData,
  type ProfileEditFormData,
  validateAndSanitizeSyncProfile,
  createDefaultFormValues,
} from './schemas';

// API Functions
export {
  // Questions API
  getDailyQuestion,
  getQuestionHistory,
  getLatestQuestions,

  // Answers API
  submitAnswer,
  getAnswers,
  getWeeklyAnswers,

  // Reports API
  generateReport,
  getWeeklyReport,
  getReportHistory,
  getLatestReport,

  // Profile API
  syncProfile,
  getSyncStatus,

  // Legacy APIs
  getMomentSlides,
  getLatestMomentReport,

  // Query Keys and Constants
  MOMENT_QUERY_KEYS,
  STALE_TIME,
  paginationDefaults,
  handleMomentApiError,
} from './apis';

// React Query Hooks
export {
  // Legacy Queries (for backward compatibility)
  useMomentSlidesQuery,
  useLatestMomentReportQuery,

  // Questions API Queries
  useDailyQuestionQuery,
  useQuestionHistoryQuery,
  useLatestQuestionsQuery,

  // Answers API Queries & Mutations
  useSubmitAnswerMutation,
  useAnswersQuery,
  useWeeklyAnswersQuery,
  useAnswersInfiniteQuery,

  // Reports API Queries & Mutations
  useGenerateReportMutation,
  useWeeklyReportQuery,
  useReportHistoryQuery,
  useLatestReportQuery,
  useReportHistoryInfiniteQuery,

  // Profile API Queries & Mutations
  useSyncProfileMutation,
  useSyncStatusQuery,

  // Utility Functions
  prefetchDailyQuestion,
  prefetchLatestQuestions,
  prefetchWeeklyReport,
  prefetchLatestReport,
  invalidateAllMomentQueries,
  invalidateQuestionsQueries,
  invalidateAnswersQueries,
  invalidateReportsQueries,
  invalidateProfileQueries,
} from './queries';

// Analytics Hooks
export { useMomentAnalytics } from './hooks/use-moment-analytics';

// Analytics Event Constants
export { MOMENT_EVENTS } from './constants/moment-events';
export type {
  MomentEventName,
  MomentPageViewProperties,
  MomentBannerProperties,
  MomentNavProperties,
  MomentQuestionCardProperties,
  MomentQuestionDetailProperties,
  MomentQuestionTypeToggleProperties,
  MomentQuestionAnswerProperties,
  MomentQuestionSubmitProperties,
  MomentReportProperties,
  MomentReportInsightProperties,
  MomentReportKeywordProperties,
  MomentReportSyncProperties,
  MomentHistoryProperties,
  MomentAIInspirationProperties,
} from './constants/moment-events';

// Default export for backward compatibility
import apis from './apis';
export default apis;