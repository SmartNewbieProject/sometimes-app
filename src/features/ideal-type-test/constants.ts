/**
 * 이상형 테스트 관련 상수
 */

import type { ResultTypeId } from './types';

// ==================== Test Configuration ====================

/**
 * 테스트 버전
 */
export const TEST_VERSION = 'v2' as const;

/**
 * 총 질문 수
 */
export const TOTAL_QUESTIONS = 5 as const;

/**
 * 질문당 선택지 수
 */
export const OPTIONS_PER_QUESTION = 3 as const;

/**
 * 세션 만료 시간 (24시간, 밀리초)
 */
export const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * 기본 언어
 */
export const DEFAULT_LANGUAGE = 'ko' as const;

/**
 * 기본 테스트 소스
 */
export const DEFAULT_TEST_SOURCE = 'mobile' as const;

// ==================== Question IDs ====================

/**
 * 질문 ID 목록
 */
export const QUESTION_IDS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] as const;

// ==================== Result Type IDs ====================

/**
 * 결과 타입 ID 목록 (5개)
 */
export const RESULT_TYPE_IDS: readonly ResultTypeId[] = [
	'romantic_emotional',
	'warm_healing',
	'free_explorer',
	'reliable_trust',
	'energetic_active',
] as const;

// ==================== Result Type Metadata ====================

/**
 * 결과 타입 메타데이터 (한국어)
 * UI에서 로컬 표시용 (API 응답과 별개)
 */
export const RESULT_TYPE_METADATA_KO: Record<
	ResultTypeId,
	{
		name: string;
		shortDescription: string;
	}
> = {
	romantic_emotional: {
		name: '로맨틱 감성형',
		shortDescription: '깊은 감정적 교류를 원하는 당신',
	},
	warm_healing: {
		name: '따뜻한 힐링형',
		shortDescription: '편안하고 다정한 관계를 원하는 당신',
	},
	free_explorer: {
		name: '자유로운 탐험가형',
		shortDescription: '서로의 성장을 응원하는 관계를 원하는 당신',
	},
	reliable_trust: {
		name: '든든한 신뢰형',
		shortDescription: '믿음직하고 안정적인 관계를 원하는 당신',
	},
	energetic_active: {
		name: '에너지 넘치는 활발형',
		shortDescription: '함께 웃고 즐기는 관계를 원하는 당신',
	},
};

/**
 * 결과 타입 메타데이터 (일본어)
 */
export const RESULT_TYPE_METADATA_JA: Record<
	ResultTypeId,
	{
		name: string;
		shortDescription: string;
	}
> = {
	romantic_emotional: {
		name: 'ロマンチック感性型',
		shortDescription: '深い感情的な交流を望むあなた',
	},
	warm_healing: {
		name: '温かいヒーリング型',
		shortDescription: '穏やかで優しい関係を望むあなた',
	},
	free_explorer: {
		name: '自由な探検家型',
		shortDescription: 'お互いの成長を応援する関係を望むあなた',
	},
	reliable_trust: {
		name: '頼れる信頼型',
		shortDescription: '信頼できて安定した関係を望むあなた',
	},
	energetic_active: {
		name: 'エネルギッシュ活発型',
		shortDescription: '一緒に笑って楽しむ関係を望むあなた',
	},
};

// ==================== API Endpoints ====================

/**
 * 이상형 테스트 API 엔드포인트
 */
export const IDEAL_TYPE_TEST_ENDPOINTS = {
	/** 테스트 시작 */
	START: '/v1/ideal-type-test/start',
	/** 답변 제출 */
	ANSWER: '/v1/ideal-type-test/answer',
	/** 세션 상태 조회 */
	SESSION_STATUS: (sessionId: string) => `/v1/ideal-type-test/session/${sessionId}`,
	/** 테스트 결과 조회 */
	RESULT: (sessionId: string) => `/v1/ideal-type-test/result/${sessionId}`,
	/** 결과 타입 통계 조회 */
	STATS: (resultTypeId: ResultTypeId) => `/v1/ideal-type-test/stats/${resultTypeId}`,
	/** 내 결과 조회 */
	MY_RESULT: '/v1/users/me/ideal-type-result',
	/** 테스트 재시도 */
	RETAKE: '/v1/users/me/ideal-type-result/retake',
	/** 결과 삭제 */
	DELETE_RESULT: '/v1/users/me/ideal-type-result',
} as const;

// ==================== Query Keys ====================

/**
 * React Query 키
 */
export const IDEAL_TYPE_TEST_QUERY_KEYS = {
	/** 모든 이상형 테스트 관련 쿼리 */
	all: ['ideal-type-test'] as const,
	/** 세션 상태 조회 */
	sessionStatus: (sessionId: string) => ['ideal-type-test', 'session', sessionId] as const,
	/** 테스트 결과 조회 */
	result: (sessionId: string) => ['ideal-type-test', 'result', sessionId] as const,
	/** 결과 타입 통계 조회 */
	stats: (resultTypeId: ResultTypeId) => ['ideal-type-test', 'stats', resultTypeId] as const,
	/** 내 결과 조회 */
	myResult: ['ideal-type-test', 'my-result'] as const,
} as const;

// ==================== Storage Keys ====================

/**
 * 로컬 스토리지 키
 */
export const IDEAL_TYPE_TEST_STORAGE_KEYS = {
	/** 현재 진행 중인 세션 ID */
	CURRENT_SESSION_ID: 'idealTypeTest.currentSessionId',
	/** 테스트 시작 시각 */
	STARTED_AT: 'idealTypeTest.startedAt',
	/** 마지막 결과 타입 ID */
	LAST_RESULT_TYPE_ID: 'idealTypeTest.lastResultTypeId',
} as const;

// ==================== Animation & UI Constants ====================

/**
 * 질문 전환 애니메이션 시간 (밀리초)
 */
export const QUESTION_TRANSITION_DURATION = 300;

/**
 * 결과 로딩 최소 시간 (밀리초)
 * 사용자 경험을 위해 결과 계산 중 최소 대기 시간
 */
export const RESULT_LOADING_MIN_DURATION = 2000;

/**
 * 진행률 바 애니메이션 시간 (밀리초)
 */
export const PROGRESS_BAR_ANIMATION_DURATION = 400;

// ==================== Share & Marketing ====================

/**
 * 결과 공유 템플릿 (한국어)
 */
export const SHARE_TEMPLATE_KO = {
	title: (resultName: string) => `나의 이상형은 "${resultName}"!`,
	description: '썸타임 이상형 테스트로 나의 연애 스타일을 알아보세요!',
	hashtags: ['썸타임', '이상형테스트', '연애스타일'],
};

/**
 * 결과 공유 템플릿 (일본어)
 */
export const SHARE_TEMPLATE_JA = {
	title: (resultName: string) => `私の理想のタイプは「${resultName}」!`,
	description: 'Sometimeの理想タイプテストで恋愛スタイルを診断しよう!',
	hashtags: ['Sometime', '理想タイプテスト', '恋愛スタイル'],
};

// ==================== Validation ====================

/**
 * 최소 답변 수 (테스트 완료 조건)
 */
export const MIN_ANSWERS_FOR_COMPLETION = TOTAL_QUESTIONS;

/**
 * 세션 ID 정규식 (UUIDv7 형식)
 */
export const SESSION_ID_REGEX = /^[0-9A-Za-z]{26,}$/;
