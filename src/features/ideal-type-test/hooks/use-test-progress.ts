import { create } from 'zustand';
import type { Answer, Question, TestResult } from '../types';

interface TestProgressState {
	// 상태
	sessionId: string | null;
	expiresAt: string | null;
	questions: Question[];
	currentQuestionIndex: number;
	answers: Answer[];
	result: TestResult | null;

	// Actions
	setSession: (sessionId: string, questions: Question[], expiresAt?: string) => void;
	addAnswer: (answer: Answer) => void;
	setResult: (result: TestResult) => void;
	nextQuestion: () => void;
	clear: () => void;
}

export const useTestProgress = create<TestProgressState>((set, get) => ({
	// 초기 상태
	sessionId: null,
	expiresAt: null,
	questions: [],
	currentQuestionIndex: 0,
	answers: [],
	result: null,

	// Actions
	setSession: (sessionId, questions, expiresAt) =>
		set({
			sessionId,
			expiresAt: expiresAt || null,
			questions,
			currentQuestionIndex: 0,
			answers: [],
			result: null,
		}),

	addAnswer: (answer) =>
		set((state) => ({
			answers: [...state.answers, answer],
		})),

	setResult: (result) => set({ result }),

	nextQuestion: () =>
		set((state) => ({
			currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1),
		})),

	clear: () =>
		set({
			sessionId: null,
			expiresAt: null,
			questions: [],
			currentQuestionIndex: 0,
			answers: [],
			result: null,
		}),
}));
