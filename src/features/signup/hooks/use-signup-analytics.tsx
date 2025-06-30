import { GA_TRACKING_ID, sendEvent, sendPageView } from '@/src/shared/utils';
import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * 회원가입 페이지에서 사용할 애널리틱스 훅
 * 페이지 뷰 및 회원가입 단계 이벤트를 추적합니다.
 *
 * @param step 현재 회원가입 단계 (terms, account, phone 등)
 * @returns 이벤트 추적 함수
 */
export const useSignupAnalytics = (step: string) => {
	const pathname = usePathname();

	// 페이지 로드 시 페이지 뷰 및 단계 이벤트 추적
	useEffect(() => {
		if (Platform.OS === 'web') {
			// 페이지 뷰 추적
			sendPageView(pathname);

			// 회원가입 단계 이벤트 추적
			sendEvent('signup_step_view', 'signup', step);
		}
	}, [pathname, step]);

	/**
	 * 회원가입 과정에서 특정 액션 이벤트 추적
	 *
	 * @param action 액션 이름 (예: 'next_button_click', 'back_button_click')
	 * @param label 추가 정보 (선택 사항)
	 */
	const trackSignupEvent = (action: string, label?: string) => {
		if (Platform.OS === 'web') {
			sendEvent(action, 'signup', `${step}${label ? `:${label}` : ''}`);
		}
	};

	return { trackSignupEvent };
};
