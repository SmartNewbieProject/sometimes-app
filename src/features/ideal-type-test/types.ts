// 질문 선택지
export interface QuestionOption {
	id: string;
	text: string;
}

// 질문
export interface Question {
	id: string;
	text: string;
	options: QuestionOption[];
}

// 답변
export interface Answer {
	questionId: string;
	selectedOptionId: string;
}

// 결과 타입 ID
export type ResultTypeId =
	| 'romantic_dreamer'
	| 'steady_supporter'
	| 'intellectual_partner'
	| 'emotional_connector'
	| 'gentle_guardian'
	| 'free_spirit'
	| 'adventure_seeker'
	| 'social_butterfly'
	| 'playful_partner'
	| 'ambitious_achiever'
	| 'creative_soul'
	| 'practical_planner';

// 테스트 결과
export interface TestResult {
	id: ResultTypeId;
	name: string;
	emoji: string;
	description: string;
	tags: string[];
}

// 테스트 소스
export type TestSource = 'web' | 'mobile';

// 테스트 시작 요청
export interface StartTestRequest {
	source?: TestSource;
}

// 테스트 시작 응답
export interface StartTestResponse {
	sessionId: string;
	questions: Question[];
	expiresAt: string;
	totalQuestions: number;
}

// 답변 제출 요청
export interface SubmitAnswerRequest {
	sessionId: string;
	answers: Answer[];
}

// 답변 제출 응답 (진행 중)
export interface SubmitAnswerProgressResponse {
	currentStep: number;
	totalSteps: number;
	isComplete: false;
}

// 답변 제출 응답 (완료)
export interface SubmitAnswerCompleteResponse {
	currentStep: number;
	totalSteps: number;
	isComplete: true;
	result: TestResult;
}

// 답변 제출 응답 (Union)
export type SubmitAnswerResponse = SubmitAnswerProgressResponse | SubmitAnswerCompleteResponse;

// 세션 상태 응답
export interface SessionStatusResponse {
	sessionId: string;
	isCompleted: boolean;
	result?: TestResult;
	completedAt?: string;
}

// 결과 조회 응답 (세션 상태와 동일)
export type TestResultResponse = SessionStatusResponse;

// 통계 조회 응답
export interface StatsResponse {
	resultTypeId: ResultTypeId;
	count: number;
	percentage: number;
}

// 내 결과 조회 응답 (인증 필요)
export interface MyResultResponse {
	id: string;
	result: TestResult;
	completedAt: string;
	testVersion: string;
}

/** 쿨다운 에러 응답 (400) */
export interface RetakeCooldownError {
	code: 'IDEAL_TYPE.BAD_REQUEST_RETAKE_COOLDOWN';
	detail: {
		retakeAvailableAt: string;
		remainingDays: number;
	};
	status: 400;
}

// 언어 코드
export type LanguageCode = 'ko' | 'ja';
