import { useQuery, useMutation, useInfiniteQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import apis, { MOMENT_QUERY_KEYS } from "../apis";
import type {
  MomentSlide,
  MomentReportResponse,
  DailyQuestionResponse,
  QuestionHistoryParams,
  LatestQuestionsResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  GetAnswersResponse,
  AnswersParams,
  WeeklyAnswersResponse,
  WeeklyAnswersParams,
  GenerateReportResponse,
  WeeklyReportResponse,
  WeeklyReportParams,
  ReportHistoryResponse,
  ReportHistoryParams,
  LatestReportResponse,
  SyncProfileRequest,
  SyncProfileResponse,
  SyncStatusResponse,
  SubmitAnswerErrorResponse,
} from "../types";
import { devLogWithTag, logError } from "@/src/shared/utils";

const CLIENT_SLIDES: MomentSlide[] = [
  {
    id: "introduction-sometimes",
    imageUrl: require("@/assets/images/moment/introduction-sometimes.webp"),
    imageType: "local",
    title: "Sometimes 소개",
    order: 1,
    externalLink: "https://www.instagram.com/p/DRUZkdrE5Oq/?img_index=1",
  }
];

// =============================================
// Legacy Queries (for backward compatibility)
// =============================================

export const useMomentSlidesQuery = () =>
  useQuery({
    queryKey: ["moment", "moment-slides"],
    queryFn: apis.getMomentSlides,
    select: (apiData: MomentSlide[]) => {
      const merged = [...CLIENT_SLIDES, ...apiData];
      return merged.sort((a, b) => {
        const orderA = a.order ?? 999;
        const orderB = b.order ?? 999;
        return orderA - orderB;
      });
    },
  });

export const useLatestMomentReportQuery = () =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.LATEST_REPORT_LEGACY,
    queryFn: apis.getLatestReport,
    staleTime: 1000 * 60 * 15, // 15분
    select: (response: any) => response?.data ?? response,
  });

// =============================================
// Questions API Queries
// =============================================

export const useDailyQuestionQuery = () =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.DAILY_QUESTION,
    queryFn: apis.getDailyQuestion,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false, // 창 포커스시 불필요한 재요청 방지
    select: (data: DailyQuestionResponse | { question: null; weekInfo: null }) => data,
    retry: (failureCount, error: Error & { status?: number; errorCode?: string }) => {
      devLogWithTag('Moment Query', `Retry ${failureCount + 1}:`, error);

      // Don't retry authentication errors
      if (error?.status === 401 || error?.errorCode === 'INSUFFICIENT_PERMISSION') {
        devLogWithTag('Moment Query', 'Auth error - not retrying');
        return false;
      }
      return failureCount < 3;
    },
  });

export const useQuestionHistoryQuery = (params: QuestionHistoryParams) =>
  useQuery({
    queryKey: [...MOMENT_QUERY_KEYS.QUESTION_HISTORY, params],
    queryFn: () => apis.getQuestionHistory(params),
    enabled: !!(params.limit !== undefined && params.offset !== undefined),
    staleTime: 1000 * 60 * 10, // 10분
  });

export const useLatestQuestionsQuery = () =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.LATEST_QUESTIONS,
    queryFn: apis.getLatestQuestions,
    staleTime: 1000 * 60 * 5, // 5분
  });

// =============================================
// Answers API Queries & Mutations
// =============================================

export const useSubmitAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitAnswerRequest) => apis.submitAnswer(data),
    onSuccess: (data) => {
      devLogWithTag('Moment Answer', 'Submission success');

      // 답변 제출 성공 시 관련 쿼리 무효화
      // NOTE: DAILY_QUESTION은 완료 UI 표시 후 사용자가 "질문함으로 돌아가기" 버튼을
      // 클릭할 때 invalidate됩니다. 즉시 invalidate하면 완료 UI가 표시되기 전에
      // 다음 질문이 갱신되어 UX 문제가 발생합니다.
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.ANSWERS });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.QUESTION_HISTORY });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROGRESS_STATUS });
    },
    onError: (error: Error & { blockedReason?: string; suggestedAction?: string }) => {
      logError('[Moment] Answer submission failed:', error);

      // Enhanced error logging for structured API errors
      if (error.name === 'SubmitAnswerError') {
        devLogWithTag('Moment Answer', 'Error details:', {
          blockedReason: error.blockedReason,
          suggestedAction: error.suggestedAction,
        });
      }
    },
  });
};

export const useAnswersQuery = (params: AnswersParams) =>
  useQuery({
    queryKey: [...MOMENT_QUERY_KEYS.ANSWERS, params],
    queryFn: () => apis.getAnswers(params),
    enabled: !!(params.limit !== undefined && params.offset !== undefined),
    staleTime: 1000 * 60 * 5, // 5분
  });

export const useWeeklyAnswersQuery = (params: WeeklyAnswersParams) =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.WEEKLY_ANSWERS(params.week, params.year),
    queryFn: () => apis.getWeeklyAnswers(params),
    enabled: !!(params.week && params.year),
    staleTime: 1000 * 60 * 15, // 15분
  });

export const useAnswersInfiniteQuery = () =>
  useInfiniteQuery({
    queryKey: MOMENT_QUERY_KEYS.ANSWERS,
    queryFn: ({ pageParam = 0 }) =>
      apis.getAnswers({ limit: 20, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.answers.length, 0);
      return totalLoaded < lastPage.answers.length ? totalLoaded : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

// =============================================
// Reports API Queries & Mutations
// =============================================

export const useGenerateReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apis.generateReport(),
    onSuccess: () => {
      // 리포트 생성 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.REPORTS });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.REPORT_HISTORY });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.LATEST_REPORT });
    },
  });
};

export const useWeeklyReportQuery = (params: WeeklyReportParams) =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.WEEKLY_REPORT(params.week, params.year),
    queryFn: () => apis.getWeeklyReport(params),
    enabled: !!(params.week && params.year),
    staleTime: 1000 * 60 * 30, // 30분
  });

export const useReportHistoryQuery = (params: ReportHistoryParams) =>
  useQuery({
    queryKey: [...MOMENT_QUERY_KEYS.REPORT_HISTORY, params],
    queryFn: () => apis.getReportHistory(params),
    enabled: !!(params.page && params.limit),
    staleTime: 0, // 페이지 접근 시마다 항상 재갱신
  });

export const useLatestReportQuery = () =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.LATEST_REPORT,
    queryFn: apis.getLatestReport,
    staleTime: 1000 * 60 * 15, // 15분
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // 명시적으로 활성화
  });

export const useReportHistoryInfiniteQuery = () =>
  useInfiniteQuery({
    queryKey: MOMENT_QUERY_KEYS.REPORT_HISTORY,
    queryFn: ({ pageParam = 1 }) => {
      return apis.getReportHistory({ page: pageParam as number, limit: 20 });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage?.pagination) {
        return undefined;
      }

      const { page, totalPages } = lastPage.pagination;
      const currentPage = (lastPageParam as number) || page;

      if (currentPage >= totalPages) {
        return undefined;
      }

      return currentPage + 1;
    },
    staleTime: 0,
  });

// =============================================
// Profile API Queries & Mutations
// =============================================

export const useSyncProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof apis.syncProfile>[0]) => apis.syncProfile(data),
    onSuccess: (_, variables) => {
      // 프로필 동기화 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROFILE });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROFILE_KEYWORDS });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROFILE_INTRODUCTION });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROGRESS_STATUS });
    },
  });
};

export const useSyncStatusQuery = (profileId: string) =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.SYNC_STATUS(profileId),
    queryFn: () => apis.getSyncStatus(profileId),
    enabled: !!profileId,
    staleTime: 1000 * 60 * 2, // 2분
    refetchInterval: (query) => {
      // 진행 중인 상태이면 30초마다 재조회
      const data = query.state.data as SyncStatusResponse | undefined;
      return (data?.syncStatus ?? data?.status) === 'pending' ? 30000 : false;
    },
  });

// =============================================
// Utility Functions for Prefetching
// =============================================

export const prefetchDailyQuestion = (queryClient: QueryClient) => {
  queryClient.prefetchQuery({
    queryKey: MOMENT_QUERY_KEYS.DAILY_QUESTION,
    queryFn: apis.getDailyQuestion,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const prefetchLatestQuestions = (queryClient: QueryClient) => {
  queryClient.prefetchQuery({
    queryKey: MOMENT_QUERY_KEYS.LATEST_QUESTIONS,
    queryFn: apis.getLatestQuestions,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const prefetchWeeklyReport = (queryClient: QueryClient, params: WeeklyReportParams) => {
  queryClient.prefetchQuery({
    queryKey: MOMENT_QUERY_KEYS.WEEKLY_REPORT(params.week, params.year),
    queryFn: () => apis.getWeeklyReport(params),
    staleTime: 1000 * 60 * 30, // 30분
  });
};

export const prefetchLatestReport = (queryClient: QueryClient) => {
  queryClient.prefetchQuery({
    queryKey: MOMENT_QUERY_KEYS.LATEST_REPORT,
    queryFn: apis.getLatestReport,
    staleTime: 1000 * 60 * 15, // 15분
  });
};

// =============================================
// Query Invalidation Utilities
// =============================================

export const invalidateAllMomentQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      return Array.isArray(query.queryKey) && query.queryKey[0] === 'moment';
    }
  });
};

export const invalidateQuestionsQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.DAILY_QUESTION });
  queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.QUESTION_HISTORY });
  queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.LATEST_QUESTIONS });
};

export const invalidateAnswersQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.ANSWERS });
};

export const invalidateReportsQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.REPORTS });
  // WEEKLY_REPORT is a function, invalidate using partial key match
  queryClient.invalidateQueries({ queryKey: ['moment', 'reports', 'weekly'] });
  queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.REPORT_HISTORY });
  queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.LATEST_REPORT });
};

export const invalidateProfileQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROFILE });
};

// =============================================
// Feature Flags
// =============================================

export { useMyMomentEnabled, MY_MOMENT_ENABLED_KEY } from "./use-my-moment-enabled";
export { useMomentOnboardingEnabled, MOMENT_ONBOARDING_ENABLED_KEY } from "./use-moment-onboarding-enabled";

// =============================================
// Additional Legacy Queries (Missing Functions)
// =============================================

// Legacy Progress Queries
export const useProgressStatusQuery = () =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.PROGRESS_STATUS,
    queryFn: apis.getUserProgressStatus,
    staleTime: 1000 * 60 * 2, // 2분
  });

export const useWeeklyProgressQuery = () =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.WEEKLY_PROGRESS,
    queryFn: apis.getWeeklyProgress,
    staleTime: 1000 * 60 * 10, // 10분
  });

// Legacy Profile Queries
export const useProfileKeywordsQuery = () =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.PROFILE_KEYWORDS,
    queryFn: apis.getRecommendedKeywords,
    staleTime: 1000 * 60 * 60 * 24, // 24시간
  });

export const useProfileIntroductionQuery = () =>
  useQuery({
    queryKey: MOMENT_QUERY_KEYS.PROFILE_INTRODUCTION,
    queryFn: apis.getProfileIntroduction,
    staleTime: 1000 * 60 * 60 * 24, // 24시간
  });

// Legacy Sync Profile Mutation
export const useLegacySyncProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: any) => apis.syncProfile(data),
    onSuccess: () => {
      // 프로필 동기화 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROFILE_KEYWORDS });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROFILE_INTRODUCTION });
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROGRESS_STATUS });
    },
  });
};

// Legacy Profile Introductions Mutations
export const useCreateProfileIntroductionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apis.createProfileIntroductions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROFILE_INTRODUCTION });
    },
  });
};

export const useUpdateIntroductionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apis.updateIntroductions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.PROFILE_INTRODUCTION });
    },
  });
};

// Legacy History Infinite Queries
export const useAnswerHistoryInfiniteQuery = () =>
  useInfiniteQuery({
    queryKey: ["moment", "answer-history"],
    queryFn: ({ pageParam = 1 }) =>
      apis.getAnswerHistory({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });


// Legacy Weekly Report Generation Mutation
export const useGenerateWeeklyReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apis.generateWeeklyReport(),
    onSuccess: () => {
      // 리포트 생성 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["moment", "weekly-report"] });
      queryClient.invalidateQueries({ queryKey: ["moment", "report-history"] });
      queryClient.invalidateQueries({ queryKey: ["moment", "progress-status"] });
    },
  });
};

// Onboarding Query exports
export * from './onboarding';