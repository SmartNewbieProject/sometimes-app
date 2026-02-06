import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOnboardingStatus,
  getOnboardingQuestions,
  submitOnboardingAnswers,
  ONBOARDING_QUERY_KEYS,
} from "../apis/onboarding";
import { MOMENT_QUERY_KEYS } from "../apis";
import type {
  OnboardingStatusResponse,
  OnboardingQuestionsResponse,
  OnboardingSubmitRequest,
  OnboardingSubmitResponse,
} from "../types";

// =======================
// 온보딩 상태 조회
// =======================
export const useOnboardingStatusQuery = (enabled = true) =>
  useQuery<OnboardingStatusResponse>({
    queryKey: ONBOARDING_QUERY_KEYS.status(),
    queryFn: getOnboardingStatus,
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
    retry: false, // 실패 시 재시도 안함
  });

// =======================
// 온보딩 질문 조회
// =======================
export const useOnboardingQuestionsQuery = (enabled = true) =>
  useQuery<OnboardingQuestionsResponse>({
    queryKey: ONBOARDING_QUERY_KEYS.questions(),
    queryFn: getOnboardingQuestions,
    enabled,
    staleTime: 1000 * 60 * 30, // 30분 (질문은 자주 바뀌지 않음)
  });

// =======================
// 온보딩 답변 제출
// =======================
export const useSubmitOnboardingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<OnboardingSubmitResponse, Error, OnboardingSubmitRequest>({
    mutationFn: submitOnboardingAnswers,
    onSuccess: () => {
      // 온보딩 상태 무효화 (needsOnboarding = false로 변경)
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.status(),
      });
      // 리포트 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: MOMENT_QUERY_KEYS.LATEST_REPORT,
      });
      queryClient.invalidateQueries({
        queryKey: MOMENT_QUERY_KEYS.REPORT_HISTORY,
      });
    },
  });
};
