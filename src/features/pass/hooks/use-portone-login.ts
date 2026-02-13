import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { checkPhoneNumberBlacklist } from '@/src/features/signup/apis';
import useSignupProgress from '@/src/features/signup/hooks/use-signup-progress';
import {
	AUTH_METHODS,
	LOGIN_ABANDONED_STEPS,
	MIXPANEL_EVENTS,
} from '@/src/shared/constants/mixpanel-events';
import { useModal } from '@/src/shared/hooks/use-modal';
import { env } from '@/src/shared/libs/env';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAppEnvironment } from '@shared/libs';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { PortOneAuthService } from '../services/portone-auth.service';
import type {
	PortOneIdentityVerificationRequest,
	PortOneIdentityVerificationResponse,
} from '../types';
import { isAdult } from '../utils';

const track = mixpanelAdapter.track.bind(mixpanelAdapter);
const getAuthMethod = () => useSignupProgress.getState().authMethod;

const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'object' && error !== null) {
		const obj = error as Record<string, unknown>;
		if (typeof obj.message === 'string') {
			return obj.message;
		}
		if (typeof obj.error === 'string') {
			return obj.error;
		}
	}
	return '로그인 처리 중 오류가 발생했습니다';
};

interface UsePortOneLoginOptions {
	onError?: (error: Error) => void;
	onSuccess?: (isNewUser: boolean) => void;
	signupPath?: string;
}

interface UsePortOneLoginReturn {
	isLoading: boolean;
	error: string | null;
	startPortOneLogin: () => Promise<void>;
	clearError: () => void;
	showMobileAuth: boolean;
	mobileAuthRequest: PortOneIdentityVerificationRequest | null;
	handleMobileAuthComplete: (response: PortOneIdentityVerificationResponse) => void;
	handleMobileAuthError: (error: Error) => void;
	handleMobileAuthCancel: () => void;
}

const validateEnvironmentVariables = () => {
	const requiredEnvVars = {
		API_URL: env.API_URL,
		STORE_ID: env.STORE_ID,
		PASS_CHANNEL_KEY: env.PASS_CHANNEL_KEY,
	};

	for (const [key, value] of Object.entries(requiredEnvVars)) {
		if (!value) {
			throw new Error(`${key} 환경변수가 설정되지 않았습니다.`);
		}
	}
};

export const usePortOneLogin = ({
	onError,
	onSuccess,
	signupPath,
}: UsePortOneLoginOptions = {}): UsePortOneLoginReturn => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showMobileAuth, setShowMobileAuth] = useState(false);
	const [mobileAuthRequest, setMobileAuthRequest] =
		useState<PortOneIdentityVerificationRequest | null>(null);
	const authStartTimeRef = useRef<number | null>(null);

	const { loginWithPass } = useAuth();
	const authService = new PortOneAuthService();
	const { showModal } = useModal();
	const { t } = useTranslation();

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const processLoginResult = useCallback(
		async (identityVerificationId: string) => {
			const loginResult = await loginWithPass(identityVerificationId);

			if (checkAppEnvironment('development') || loginResult.isNewUser) {
				const birthday = loginResult.certificationInfo?.birthday;
				const phone = loginResult.certificationInfo?.phone;

				if (birthday && !isAdult(birthday)) {
					// 기존 이벤트
					track('Signup_AgeCheck_Failed', {
						birthday,
						auth_method: getAuthMethod(),
						env: process.env.EXPO_PUBLIC_TRACKING_MODE,
					});

					// 나이 제한 상세 이벤트
					const birthYear = Number.parseInt(birthday.substring(0, 4), 10);
					const currentYear = new Date().getFullYear();
					const calculatedAge = currentYear - birthYear;
					track(MIXPANEL_EVENTS.SIGNUP_AGE_RESTRICTION_BLOCKED, {
						birth_year: birthYear,
						calculated_age: calculatedAge,
						auth_method: getAuthMethod(),
						env: process.env.EXPO_PUBLIC_TRACKING_MODE,
					});

					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					router.push('/auth/age-restriction' as any);
					return;
				}

				if (phone) {
					try {
						const { isBlacklisted } = await checkPhoneNumberBlacklist(phone);

						if (isBlacklisted) {
							// 기존 이벤트
							track('Signup_PhoneBlacklist_Failed', {
								phone,
								auth_method: getAuthMethod(),
								env: process.env.EXPO_PUBLIC_TRACKING_MODE,
							});

							// 블랙리스트 상세 이벤트
							track(MIXPANEL_EVENTS.SIGNUP_BLACKLIST_BLOCKED, {
								auth_method: getAuthMethod(),
								block_reason: 'phone_blacklist',
								env: process.env.EXPO_PUBLIC_TRACKING_MODE,
							});

							showModal({
								title: t('features.pass.hooks.가입_제한'),
								children: t(
									'features.pass.hooks.신고_접수_또는_프로필_정보_부적합_등의_사유로_가입이',
								),
								primaryButton: {
									text: t('features.pass.hooks.확인'),
									onClick: () => {
										router.replace('/');
									},
								},
							});
							return;
						}
					} catch (error) {
						console.error('블랙리스트 체크 오류:', error);
						track('Signup_Error', {
							stage: 'PhoneBlacklistCheck',
							auth_method: getAuthMethod(),
							env: process.env.EXPO_PUBLIC_TRACKING_MODE,
							message: error instanceof Error ? error.message : String(error),
						});
						router.replace('/');
						return;
					}
				}

				track('Signup_Route_Entered', {
					screen: 'AreaSelect',
					platform: 'pass',
					auth_method: getAuthMethod(),
					env: process.env.EXPO_PUBLIC_TRACKING_MODE,
				});

				// 보안: certificationInfo를 AsyncStorage에 저장 (URL에 노출 방지)
				await AsyncStorage.setItem(
					'signup_certification_info',
					JSON.stringify({
						...loginResult.certificationInfo,
						loginType: 'pass',
						identityVerificationId,
					}),
				);

				// biome-ignore lint/suspicious/noExplicitAny: dynamic signup path
				router.push((signupPath || '/auth/signup/university') as any);
				onSuccess?.(true);
			} else {
				router.replace('/home');
				onSuccess?.(false);
			}
		},
		[loginWithPass, onSuccess, showModal, t, signupPath],
	);

	const handleMobileAuthComplete = useCallback(
		async (response: PortOneIdentityVerificationResponse) => {
			try {
				if (!response.identityVerificationId) {
					throw new Error('본인인증 ID를 받지 못했습니다.');
				}

				const durationSeconds = authStartTimeRef.current
					? Math.round((Date.now() - authStartTimeRef.current) / 1000)
					: undefined;

				// 외부 앱에서 복귀 성공
				track(MIXPANEL_EVENTS.AUTH_EXTERNAL_APP_RETURNED, {
					auth_method: AUTH_METHODS.PASS,
					time_away_seconds: durationSeconds,
					returned_with_result: true,
					platform: Platform.OS,
					env: process.env.EXPO_PUBLIC_TRACKING_MODE,
				});

				// 본인인증 완료
				track(MIXPANEL_EVENTS.SIGNUP_IDENTITY_VERIFICATION_COMPLETED, {
					auth_method: getAuthMethod(),
					duration_seconds: durationSeconds,
					platform: Platform.OS,
					env: process.env.EXPO_PUBLIC_TRACKING_MODE,
				});

				await processLoginResult(response.identityVerificationId);
				authStartTimeRef.current = null;
				setShowMobileAuth(false);
				setMobileAuthRequest(null);
			} catch (error) {
				const errorMessage = getErrorMessage(error);
				console.error('모바일 본인인증 완료 처리 중 오류:', errorMessage);
				track('Signup_Error', {
					stage: 'handleMobileAuthComplete',
					message: errorMessage,
					auth_method: getAuthMethod(),
					env: process.env.EXPO_PUBLIC_TRACKING_MODE,
				});
				setError(errorMessage);
				onError?.(new Error(errorMessage));
			} finally {
				setIsLoading(false);
			}
		},
		[processLoginResult, onError],
	);

	const handleMobileAuthError = useCallback(
		(error: Error) => {
			console.error('모바일 본인인증 오류:', error);

			const timeAwaySeconds = authStartTimeRef.current
				? Math.round((Date.now() - authStartTimeRef.current) / 1000)
				: undefined;

			// 외부 앱에서 복귀 (에러)
			track(MIXPANEL_EVENTS.AUTH_EXTERNAL_APP_RETURNED, {
				auth_method: AUTH_METHODS.PASS,
				time_away_seconds: timeAwaySeconds,
				returned_with_result: false,
				platform: Platform.OS,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});

			// 에러 타입 분류
			const errorMessage = error.message.toLowerCase();
			let errorType = 'unknown';
			if (errorMessage.includes('network') || errorMessage.includes('연결')) {
				errorType = 'network';
			} else if (errorMessage.includes('timeout') || errorMessage.includes('시간')) {
				errorType = 'timeout';
			} else if (errorMessage.includes('install') || errorMessage.includes('설치')) {
				errorType = 'app_not_installed';
			} else if (errorMessage.includes('carrier') || errorMessage.includes('통신사')) {
				errorType = 'carrier_error';
			} else if (errorMessage.includes('certificate') || errorMessage.includes('인증서')) {
				errorType = 'certificate_expired';
			}

			// 인증 에러 상세
			track(MIXPANEL_EVENTS.AUTH_VERIFICATION_ERROR, {
				auth_method: AUTH_METHODS.PASS,
				error_type: errorType,
				error_message: error.message,
				platform: Platform.OS,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});

			track('Signup_IdentityVerification_Failed', {
				reason: error.message,
				error_type: errorType,
				auth_method: getAuthMethod(),
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});

			authStartTimeRef.current = null;
			setError(error.message);
			setShowMobileAuth(false);
			setMobileAuthRequest(null);
			setIsLoading(false);
			onError?.(error);
		},
		[onError],
	);

	const handleMobileAuthCancel = useCallback(() => {
		const timeSpentSeconds = authStartTimeRef.current
			? Math.round((Date.now() - authStartTimeRef.current) / 1000)
			: undefined;

		track('Signup_IdentityVerification_Cancelled', {
			auth_method: getAuthMethod(),
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		track('Auth_Login_Abandoned', {
			auth_method: AUTH_METHODS.PASS,
			abandoned_step: LOGIN_ABANDONED_STEPS.USER_CANCELLED,
			time_spent_seconds: timeSpentSeconds,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		authStartTimeRef.current = null;
		setShowMobileAuth(false);
		setMobileAuthRequest(null);
		setIsLoading(false);
	}, []);

	const handleWebAuth = useCallback(async () => {
		const authResponse = await authService.requestIdentityVerification();

		if (!authResponse.identityVerificationId) {
			throw new Error('본인인증 ID를 받지 못했습니다.');
		}

		await processLoginResult(authResponse.identityVerificationId);
	}, [authService, processLoginResult]);

	const handleMobileAuth = useCallback(() => {
		const request: PortOneIdentityVerificationRequest = {
			storeId: env.STORE_ID,
			channelKey: env.PASS_CHANNEL_KEY,
			identityVerificationId: `cert_${Date.now()}`,
		};

		// 외부 앱(PASS) 이동 추적
		track(MIXPANEL_EVENTS.AUTH_EXTERNAL_APP_OPENED, {
			auth_method: AUTH_METHODS.PASS,
			timestamp: Date.now(),
			platform: Platform.OS,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		setMobileAuthRequest(request);
		setShowMobileAuth(true);
	}, []);

	const startPortOneLogin = useCallback(async () => {
		try {
			setError(null);
			authStartTimeRef.current = Date.now();

			track('Signup_IdentityVerification_Started', {
				platform: Platform.OS,
				type: 'pass',
				auth_method: getAuthMethod(),
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});

			// 개발 환경에서는 실제 PASS 인증을 건너뛰고 바로 백엔드 dev API 호출
			if (__DEV__) {
				setIsLoading(true);
				await processLoginResult('dev_mock_id');
				setIsLoading(false);
				return;
			}

			validateEnvironmentVariables();

			if (Platform.OS === 'web') {
				setIsLoading(true);
				await handleWebAuth();
			} else {
				// 모바일: 인증 화면으로 바로 전환되므로 isLoading 불필요
				handleMobileAuth();
			}
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			track('Signup_Error', {
				stage: 'startPortOneLogin',
				message: errorMessage,
				auth_method: getAuthMethod(),
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
			setError(errorMessage);
			onError?.(new Error(errorMessage));
			setIsLoading(false);
		}
	}, [handleWebAuth, handleMobileAuth, onError, processLoginResult]);

	return {
		isLoading,
		error,
		startPortOneLogin,
		clearError,
		showMobileAuth,
		mobileAuthRequest,
		handleMobileAuthComplete,
		handleMobileAuthError,
		handleMobileAuthCancel,
	};
};
