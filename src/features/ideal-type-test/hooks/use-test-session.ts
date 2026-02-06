import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import type { Answer, Question } from '../types';

const STORAGE_KEY = '@sometime:ideal-type-test:session';

export interface TestSession {
	sessionId: string;
	expiresAt: string;
	currentStep: number;
	answers: Answer[];
	questions?: Question[];
}

export const useTestSession = () => {
	/**
	 * 세션 저장
	 */
	const saveSession = useCallback(async (session: TestSession): Promise<void> => {
		try {
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
		} catch (error) {
			console.warn('Failed to save test session:', error);
		}
	}, []);

	/**
	 * 세션 조회 (TTL 체크 포함)
	 */
	const getSession = useCallback(async (): Promise<TestSession | null> => {
		try {
			const value = await AsyncStorage.getItem(STORAGE_KEY);
			if (!value) return null;

			const session: TestSession = JSON.parse(value);

			// 24시간 TTL 체크
			const expiresAt = new Date(session.expiresAt);
			const now = new Date();

			if (now > expiresAt) {
				// 만료된 세션 삭제
				await clearSession();
				return null;
			}

			return session;
		} catch (error) {
			console.warn('Failed to get test session:', error);
			return null;
		}
	}, []);

	/**
	 * 세션 삭제
	 */
	const clearSession = useCallback(async (): Promise<void> => {
		try {
			await AsyncStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear test session:', error);
		}
	}, []);

	/**
	 * 세션 만료 여부 확인
	 */
	const isSessionExpired = useCallback(async (): Promise<boolean> => {
		const session = await getSession();
		return session === null;
	}, [getSession]);

	return {
		saveSession,
		getSession,
		clearSession,
		isSessionExpired,
	};
};
