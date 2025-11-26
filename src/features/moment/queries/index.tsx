import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import apis from "../apis";
import type { MomentSlide, MomentReportResponse } from "../types";
import type {
  DailyQuestionResponse,
  UpdatedDailyQuestionResponse,
  NoQuestionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  WeeklyReport,
  WeeklyReportRequest,
  ProfileKeywordsResponse,
  ProfileIntroductionResponse,
  SyncProfileRequest,
  SyncProfileResponse,
  ProfileIntroductionsRequest,
  ProfileIntroductionsResponse,
  AnswerHistoryResponse,
  ReportHistoryResponse,
  UserProgressStatus,
  WeeklyProgress,
  PaginationParams
} from "../apis";

const CLIENT_SLIDES: MomentSlide[] = [
  {
    id: "introduction-sometimes",
    imageUrl: require("@/assets/images/moment/introduction-sometimes.png"),
    imageType: "local",
    title: "Sometimes 소개",
    order: 1,
  }
];

// 기존 슬라이드 쿼리
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

// 질문 관련 쿼리
export const useDailyQuestionQuery = () =>
  useQuery({
    queryKey: ["moment", "daily-question"],
    queryFn: apis.getDailyQuestion,
    staleTime: 1000 * 60 * 5, // 5분
    select: (data: UpdatedDailyQuestionResponse | NoQuestionResponse) => {
      // questionId가 null이면 질문이 없는 경우
      if (data.questionId === null) {
        return null;
      }
      return data;
    },
  });

export const useSubmitAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitAnswerRequest) => apis.submitAnswer(data),
    onSuccess: () => {
      // 답변 제출 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["moment", "daily-question"] });
      queryClient.invalidateQueries({ queryKey: ["moment", "progress-status"] });
    },
  });
};

// 리포트 관련 쿼리
export const useWeeklyReportQuery = (params: WeeklyReportRequest) =>
  useQuery({
    queryKey: ["moment", "weekly-report", params.weekNumber, params.year],
    queryFn: () => apis.getWeeklyReport(params),
    enabled: !!(params.weekNumber && params.year),
    staleTime: 1000 * 60 * 30, // 30분
  });

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

// 프로필 관련 쿼리
export const useProfileKeywordsQuery = () =>
  useQuery({
    queryKey: ["moment", "profile-keywords"],
    queryFn: apis.getRecommendedKeywords,
    staleTime: 1000 * 60 * 60 * 24, // 24시간
  });

export const useProfileIntroductionQuery = () =>
  useQuery({
    queryKey: ["moment", "profile-introduction"],
    queryFn: apis.getProfileIntroduction,
    staleTime: 1000 * 60 * 60 * 24, // 24시간
  });

export const useSyncProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: SyncProfileRequest) => apis.syncProfile(data),
    onSuccess: () => {
      // 프로필 동기화 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["moment", "profile-keywords"] });
      queryClient.invalidateQueries({ queryKey: ["moment", "profile-introduction"] });
      queryClient.invalidateQueries({ queryKey: ["moment", "progress-status"] });
    },
  });
};

export const useCreateProfileIntroductionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileIntroductionsRequest) => apis.createProfileIntroductions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moment", "profile-introduction"] });
    },
  });
};

export const useUpdateIntroductionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileIntroductionsRequest) => apis.updateIntroductions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moment", "profile-introduction"] });
    },
  });
};

// 이력 관련 무한 스크롤 쿼리
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

export const useReportHistoryInfiniteQuery = () =>
  useInfiniteQuery({
    queryKey: ["moment", "report-history"],
    queryFn: ({ pageParam = 1 }) =>
      apis.getReportHistory({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 0, // 페이지 접근 시마다 항상 재갱신
  });

// 진행 상태 관련 쿼리
export const useProgressStatusQuery = () =>
  useQuery({
    queryKey: ["moment", "progress-status"],
    queryFn: apis.getUserProgressStatus,
    staleTime: 1000 * 60 * 2, // 2분
  });

export const useWeeklyProgressQuery = () =>
  useQuery({
    queryKey: ["moment", "weekly-progress"],
    queryFn: apis.getWeeklyProgress,
    staleTime: 1000 * 60 * 10, // 10분
  });

// 최신 모먼트 리포트 쿼리
export const useLatestMomentReportQuery = () =>
  useQuery({
    queryKey: ["moment", "latest-report"],
    queryFn: apis.getLatestMomentReport,
    staleTime: 1000 * 60 * 15, // 15분
    select: (response: MomentReportResponse) => response.data,
  });

// 유틸리티 함수들
export const prefetchDailyQuestion = (queryClient: QueryClient) => {
  queryClient.prefetchQuery({
    queryKey: ["moment", "daily-question"],
    queryFn: apis.getDailyQuestion,
  });
};

export const prefetchProgressStatus = (queryClient: QueryClient) => {
  queryClient.prefetchQuery({
    queryKey: ["moment", "progress-status"],
    queryFn: apis.getUserProgressStatus,
  });
};
