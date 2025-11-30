import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { checkPhoneNumberBlacklist } from '@/src/features/signup/apis';
import { useModal } from '@/src/shared/hooks/use-modal';
import { track } from '@amplitude/analytics-react-native';
import { checkAppEnvironment, logger } from '@/src/shared/libs';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { PortOneAuthService } from '../services/portone-auth.service';
import type {
	PortOneIdentityVerificationRequest,
	PortOneIdentityVerificationResponse,
} from '../types';
import { isAdult } from '../utils';

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
}

const validateEnvironmentVariables = () => {
	const requiredEnvVars = {
		EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
		EXPO_PUBLIC_STORE_ID: process.env.EXPO_PUBLIC_STORE_ID,
		EXPO_PUBLIC_PASS_CHANNEL_KEY: process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY,
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

	const { loginWithPass } = useAuth();
	const authService = new PortOneAuthService();
	const { showModal } = useModal();

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
								title: '가입 제한',
								children: '신고 접수 또는 프로필 정보 부적합 등의 사유로 가입이 제한되었습니다.',
								primaryButton: {
									text: '확인',
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
				router.push({
					pathname: '/auth/signup/university',
					params: {
						certificationInfo: JSON.stringify(loginResult.certificationInfo),
					},
				});
				onSuccess?.(true);
			} else {
				router.replace('/home');
				onSuccess?.(false);
			}
		},
		[loginWithPass, onSuccess, showModal],
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
				setShowMobileAuth(false);
				setMobileAuthRequest(null);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.';
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
			setError(error.message);
			setShowMobileAuth(false);
			setMobileAuthRequest(null);
			setIsLoading(false);
			onError?.(error);
		},
		[onError],
	);

	const handleWebAuth = useCallback(async () => {
		const authResponse = await authService.requestIdentityVerification();

		if (!authResponse.identityVerificationId) {
			throw new Error('본인인증 ID를 받지 못했습니다.');
		}

		await processLoginResult(authResponse.identityVerificationId);
	}, [authService, processLoginResult]);

	const handleMobileAuth = useCallback(() => {
		const request: PortOneIdentityVerificationRequest = {
			storeId: process.env.EXPO_PUBLIC_STORE_ID as string,
			channelKey: process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY as string,
			identityVerificationId: `cert_${Date.now()}`,
		};

		setMobileAuthRequest(request);
		setShowMobileAuth(true);
	}, []);

	const startPortOneLogin = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			// development 환경에서는 외부 인증 창을 띄우지 않고 바로 다음 프로세스로
			if (checkAppEnvironment('development')) {
				track('Signup_IdentityVerification_Started', {
					platform: Platform.OS,
					type: 'pass',
					env: process.env.EXPO_PUBLIC_TRACKING_MODE,
				});
				logger.debug('개발 환경에서는 가짜 본인인증 ID로 바로 처리합니다.');
				await processLoginResult(`dev_mock_${Date.now()}`);
				return;
			}

			validateEnvironmentVariables();

			track('Signup_IdentityVerification_Started', {
				platform: Platform.OS,
				type: 'pass',
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});

			if (Platform.OS === 'web') {
				await handleWebAuth();
			} else {
				handleMobileAuth();
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.';
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
	};
};
