import { create } from 'zustand';
import type { OnboardingAnswer, OnboardingQuestion } from '../types';

interface OnboardingStore {
	// 진행 상태
	currentStep: number;
	totalSteps: number;

	// 데이터
	questions: OnboardingQuestion[];
	answers: Map<string, OnboardingAnswer>;

	// 액션
	setQuestions: (questions: OnboardingQuestion[]) => void;
	setAnswer: (questionId: string, answer: OnboardingAnswer) => void;
	nextStep: () => void;
	prevStep: () => void;
	reset: () => void;

	// 계산된 값 (getter 함수)
	getCurrentQuestion: () => OnboardingQuestion | null;
	getProgress: () => number;
	isLastStep: () => boolean;
	canProceed: () => boolean;
	getAnswersArray: () => OnboardingAnswer[];
}

export const useMomentOnboarding = create<OnboardingStore>((set, get) => ({
	// 초기 상태
	currentStep: 0,
	totalSteps: 0,
	questions: [],
	answers: new Map(),

	// 질문 설정
	setQuestions: (questions) => {
		set({
			questions,
			totalSteps: questions.length,
			currentStep: 0,
			answers: new Map(),
		});
	},

	// 답변 저장
	setAnswer: (questionId, answer) => {
		const { answers } = get();
		const newAnswers = new Map(answers);
		newAnswers.set(questionId, answer);
		set({ answers: newAnswers });
	},

	// 다음 단계
	nextStep: () => {
		const { currentStep, totalSteps } = get();
		if (currentStep < totalSteps - 1) {
			set({ currentStep: currentStep + 1 });
		}
	},

	// 이전 단계
	prevStep: () => {
		const { currentStep } = get();
		if (currentStep > 0) {
			set({ currentStep: currentStep - 1 });
		}
	},

	// 초기화
	reset: () => {
		set({
			currentStep: 0,
			totalSteps: 0,
			questions: [],
			answers: new Map(),
		});
	},

	// 현재 질문 가져오기
	getCurrentQuestion: () => {
		const { questions, currentStep } = get();
		return questions[currentStep] ?? null;
	},

	// 진행도 (0~1)
	getProgress: () => {
		const { currentStep, totalSteps } = get();
		if (totalSteps === 0) return 0;
		return (currentStep + 1) / totalSteps;
	},

	// 마지막 단계 여부
	isLastStep: () => {
		const { currentStep, totalSteps } = get();
		return currentStep === totalSteps - 1;
	},

	// 다음으로 진행 가능 여부 (선택지 또는 텍스트 중 하나라도 유효하면 통과)
	canProceed: () => {
		const { answers, questions, currentStep } = get();
		const currentQuestion = questions[currentStep];
		if (!currentQuestion) return false;

		const answer = answers.get(currentQuestion.id);
		if (!answer) return false;

		return !!answer.optionId || !!answer.answer?.trim();
	},

	// 제출용 답변 배열 반환
	getAnswersArray: () => {
		const { answers } = get();
		return Array.from(answers.values());
	},
}));
