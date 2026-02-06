/**
 * 이상형 테스트 관련 상수
 */

import type { ResultTypeId } from './types';

// ==================== Test Configuration ====================

/**
 * 테스트 버전
 */
export const TEST_VERSION = 'v1' as const;

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
 * 결과 타입 ID 목록 (12개)
 */
export const RESULT_TYPE_IDS: readonly ResultTypeId[] = [
	'romantic_dreamer',
	'steady_supporter',
	'intellectual_partner',
	'emotional_connector',
	'gentle_guardian',
	'free_spirit',
	'adventure_seeker',
	'social_butterfly',
	'playful_partner',
	'ambitious_achiever',
	'creative_soul',
	'practical_planner',
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
		emoji: string;
		shortDescription: string;
	}
> = {
	romantic_dreamer: {
		name: '로맨틱 드리머',
		emoji: '💕',
		shortDescription: '감성적이고 로맨틱한 연애를 꿈꾸는 타입',
	},
	steady_supporter: {
		name: '든든한 서포터',
		emoji: '🤝',
		shortDescription: '안정적이고 믿음직한 관계를 원하는 타입',
	},
	intellectual_partner: {
		name: '지적인 파트너',
		emoji: '📚',
		shortDescription: '깊은 대화와 지적인 자극을 즐기는 타입',
	},
	emotional_connector: {
		name: '감정 커넥터',
		emoji: '💗',
		shortDescription: '깊은 감정적 교류를 중시하는 타입',
	},
	gentle_guardian: {
		name: '포근한 수호자',
		emoji: '🏠',
		shortDescription: '편안하고 따뜻한 관계를 추구하는 타입',
	},
	free_spirit: {
		name: '자유로운 영혼',
		emoji: '🦋',
		shortDescription: '독립적이고 자유로운 관계를 원하는 타입',
	},
	adventure_seeker: {
		name: '모험 추구자',
		emoji: '🌍',
		shortDescription: '새로운 경험을 함께 즐기고 싶은 타입',
	},
	social_butterfly: {
		name: '소셜 버터플라이',
		emoji: '🎉',
		shortDescription: '사교적이고 활발한 연애를 즐기는 타입',
	},
	playful_partner: {
		name: '유쾌한 파트너',
		emoji: '😄',
		shortDescription: '웃음이 넘치는 재미있는 연애를 원하는 타입',
	},
	ambitious_achiever: {
		name: '열정적 성취자',
		emoji: '🚀',
		shortDescription: '목표 지향적이고 열정적인 타입',
	},
	creative_soul: {
		name: '창의적 영혼',
		emoji: '🎨',
		shortDescription: '창의적이고 예술적인 감성을 가진 타입',
	},
	practical_planner: {
		name: '현실적 플래너',
		emoji: '📋',
		shortDescription: '계획적이고 현실적인 연애를 원하는 타입',
	},
};

/**
 * 결과 타입 메타데이터 (일본어)
 */
export const RESULT_TYPE_METADATA_JA: Record<
	ResultTypeId,
	{
		name: string;
		emoji: string;
		shortDescription: string;
	}
> = {
	romantic_dreamer: {
		name: 'ロマンチックドリーマー',
		emoji: '💕',
		shortDescription: '感性的でロマンチックな恋愛を夢見るタイプ',
	},
	steady_supporter: {
		name: '頼れるサポーター',
		emoji: '🤝',
		shortDescription: '安定的で信頼できる関係を望むタイプ',
	},
	intellectual_partner: {
		name: '知的パートナー',
		emoji: '📚',
		shortDescription: '深い会話と知的刺激を楽しむタイプ',
	},
	emotional_connector: {
		name: '感情コネクター',
		emoji: '💗',
		shortDescription: '深い感情的交流を重視するタイプ',
	},
	gentle_guardian: {
		name: '優しい守護者',
		emoji: '🏠',
		shortDescription: '心地よく温かい関係を求めるタイプ',
	},
	free_spirit: {
		name: '自由な魂',
		emoji: '🦋',
		shortDescription: '独立的で自由な関係を望むタイプ',
	},
	adventure_seeker: {
		name: '冒険探求者',
		emoji: '🌍',
		shortDescription: '新しい経験を一緒に楽しみたいタイプ',
	},
	social_butterfly: {
		name: 'ソーシャルバタフライ',
		emoji: '🎉',
		shortDescription: '社交的で活発な恋愛を楽しむタイプ',
	},
	playful_partner: {
		name: '楽しいパートナー',
		emoji: '😄',
		shortDescription: '笑いあふれる楽しい恋愛を望むタイプ',
	},
	ambitious_achiever: {
		name: '情熱的達成者',
		emoji: '🚀',
		shortDescription: '目標志向的で情熱的なタイプ',
	},
	creative_soul: {
		name: 'クリエイティブソウル',
		emoji: '🎨',
		shortDescription: '創造的で芸術的な感性を持つタイプ',
	},
	practical_planner: {
		name: '現実的プランナー',
		emoji: '📋',
		shortDescription: '計画的で現実的な恋愛を望むタイプ',
	},
};

// ==================== API Endpoints ====================

/**
 * 이상형 테스트 API 엔드포인트
 */
export const IDEAL_TYPE_TEST_ENDPOINTS = {
	/** 테스트 시작 */
	START: '/api/v1/ideal-type-test/start',
	/** 답변 제출 */
	ANSWER: '/api/v1/ideal-type-test/answer',
	/** 세션 상태 조회 */
	SESSION_STATUS: (sessionId: string) => `/api/v1/ideal-type-test/session/${sessionId}`,
	/** 테스트 결과 조회 */
	RESULT: (sessionId: string) => `/api/v1/ideal-type-test/result/${sessionId}`,
	/** 결과 타입 통계 조회 */
	STATS: (resultTypeId: ResultTypeId) => `/api/v1/ideal-type-test/stats/${resultTypeId}`,
	/** 내 결과 조회 */
	MY_RESULT: '/api/v1/users/me/ideal-type-result',
	/** 테스트 재시도 */
	RETAKE: '/api/v1/users/me/ideal-type-result/retake',
	/** 결과 삭제 */
	DELETE_RESULT: '/api/v1/users/me/ideal-type-result',
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
