import { axiosClient } from "@/src/shared/libs";
import type {
  OnboardingStatusResponse,
  OnboardingQuestionsResponse,
  OnboardingSubmitRequest,
  OnboardingSubmitResponse,
  OnboardingSkipResponse,
} from "../types";

// =======================
// 온보딩 API 함수
// =======================

/**
 * 온보딩 필요 여부 확인
 * - needsOnboarding: true면 온보딩 필요
 * - completedAt: 완료 시간 (완료된 경우)
 */
export const getOnboardingStatus = (): Promise<OnboardingStatusResponse> => {
  return axiosClient.get('/v2/moment/onboarding/status');
};

/**
 * 온보딩 질문 목록 조회
 * - 4개의 질문 (Choice 3개 + Text 1개)
 */
export const getOnboardingQuestions = (): Promise<OnboardingQuestionsResponse> => {
  return axiosClient.get('/v2/moment/onboarding/questions');
};

/**
 * 온보딩 답변 제출 및 리포트 생성
 * - 모든 질문에 대한 답변을 제출
 * - 즉시 리포트 생성 후 반환
 */
export const submitOnboardingAnswers = (
  data: OnboardingSubmitRequest
): Promise<OnboardingSubmitResponse> => {
  return axiosClient.post('/v2/moment/onboarding/submit', data);
};

/**
 * 온보딩 건너뛰기
 */
export const skipOnboarding = (): Promise<OnboardingSkipResponse> => {
  return axiosClient.post('/v2/moment/onboarding/skip');
};

// Query Keys
export const ONBOARDING_QUERY_KEYS = {
  all: ['moment', 'onboarding'] as const,
  status: () => [...ONBOARDING_QUERY_KEYS.all, 'status'] as const,
  questions: () => [...ONBOARDING_QUERY_KEYS.all, 'questions'] as const,
};
