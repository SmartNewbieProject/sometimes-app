import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { checkPhoneNumberBlacklist } from '@/src/features/signup/apis';
import { useModal } from '@/src/shared/hooks/use-modal';
import { env } from '@/src/shared/libs/env';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { LOGIN_ABANDONED_STEPS, AUTH_METHODS } from '@/src/shared/constants/mixpanel-events';
import { checkAppEnvironment } from '@shared/libs';
import { router } from 'expo-router';
import { useCallback, useState, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { PortOneAuthService } from '../services/portone-auth.service';
import type {
	PortOneIdentityVerificationRequest,
	PortOneIdentityVerificationResponse,
} from '../types';
import { isAdult } from '../utils';

const track = mixpanelAdapter.track.bind(mixpanelAdapter);

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
					track('Signup_AgeCheck_Failed', { birthday, env: process.env.EXPO_PUBLIC_TRACKING_MODE });
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					router.push('/auth/age-restriction' as any);
					return;
				}

				if (phone) {
					try {
						const { isBlacklisted } = await checkPhoneNumberBlacklist(phone);

						if (isBlacklisted) {
							track('Signup_PhoneBlacklist_Failed', {
								phone,
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

				router.push('/auth/signup/university');
				onSuccess?.(true);
			} else {
				router.replace('/home');
				onSuccess?.(false);
			}
		},
		[loginWithPass, onSuccess, showModal, t],
	);

	const handleMobileAuthComplete = useCallback(
		async (response: PortOneIdentityVerificationResponse) => {
			try {
				if (!response.identityVerificationId) {
					throw new Error('본인인증 ID를 받지 못했습니다.');
				}

				track('Signup_IdentityVerification_Completed', {
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
			track('Signup_IdentityVerification_Failed', {
				reason: error.message,
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
