import { MobileIdentityVerification, usePortOneLogin } from '@/src/features/pass';
import { isAdult } from '@/src/features/pass/utils';
import {
	AUTH_METHODS,
	LOGIN_ABANDONED_STEPS,
	MIXPANEL_EVENTS,
} from '@/src/shared/constants/mixpanel-events';
import { useMixpanel } from '@/src/shared/hooks';
import { useModal } from '@/src/shared/hooks/use-modal';
import { env } from '@/src/shared/libs/env';
import { isJapanese } from '@/src/shared/libs/local';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { Button, Show, SlideToAbout, Text } from '@/src/shared/ui';
import { devLogWithTag } from '@/src/shared/utils';
import KakaoLogo from '@assets/icons/kakao-logo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as KakaoLogin from '@react-native-kakao/user';
import * as Localization from 'expo-localization';
import { usePathname, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useAuth } from '../../auth';
import { PrivacyNotice } from '../../auth/ui/privacy-notice';
import { checkPhoneNumberBlacklist } from '../apis';
import useSignupProgress from '../hooks/use-signup-progress';
import AppleLoginButton from './apple-login-button';
import { SignupFastBadge } from './signup-fast-badge';
import { SocialLoginIcons } from './social-login-icons';
import { SometimeLogo } from './sometime-logo';
import UniversityLogos from './university-logos';

/**
 * 로그인 폼 - JP/KR 분기 처리
 * - JP: SMS 인증 + Apple 로그인
 * - KR: Kakao + PASS + Apple 로그인
 */
export default function LoginForm() {
	if (isJapanese()) {
		return <JpLoginForm />;
	}
	return <KrLoginForm />;
}

/**
 * JP 로그인 폼 - SMS 인증 + Apple 로그인
 * SMS 인증 버튼 클릭 시 /auth/jp-sms 페이지로 이동
 */
function JpLoginForm() {
	const { t } = useTranslation();
	const routerLocal = useRouter();

	const handleSmsAuth = () => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_AUTH_STARTED, {
			auth_method: 'sms',
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
		routerLocal.push('/auth/jp-sms');
	};

	return (
		<View style={loginFormStyles.container}>
			<View style={loginFormStyles.universityLogos}>
				<UniversityLogos logoSize={64} country="jp" />
			</View>

			<View style={loginFormStyles.slideToAboutWrapper}>
				<SlideToAbout onAction={() => routerLocal.push('/onboarding?source=login')} />
			</View>

			<View style={loginFormStyles.buttonsContainer}>
				<View style={loginFormStyles.buttonWrapper}>
					<Button
						variant="primary"
						size="lg"
						rounded="full"
						onPress={handleSmsAuth}
						styles={{
							width: 330,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text
							textColor="white"
							size="18"
							weight="semibold"
							style={{ lineHeight: 40, textAlign: 'center' }}
						>
							{t('features.jp-auth.login_button')}
						</Text>
					</Button>
				</View>

				<View>
					<AppleLoginButton />
				</View>
			</View>

			<View style={loginFormStyles.privacyNotice}>
				<PrivacyNotice />
			</View>
		</View>
	);
}

/**
 * KR 로그인 폼 - Kakao + PASS + Apple 로그인 (기존 코드)
 */
function KrLoginForm() {
	const {
		startPortOneLogin,
		isLoading,
		error,
		clearError,
		showMobileAuth,
		mobileAuthRequest,
		handleMobileAuthComplete,
		handleMobileAuthError,
		handleMobileAuthCancel,
	} = usePortOneLogin();
	const { authEvents, signupEvents } = useMixpanel();
	const pathname = usePathname();
	const { regionCode } = Localization.getLocales()[0];
	const isUS = regionCode === 'US';
	const { t } = useTranslation();
	const router = useRouter();
	const { setAuthMethod } = useSignupProgress();
	const [passRetryCount, setPassRetryCount] = useState(0);
	const [passLastFailureReason, setPassLastFailureReason] = useState<string | null>(null);

	const onPressPassLogin = async () => {
		const loginStartTime = Date.now();

		setAuthMethod(AUTH_METHODS.PASS);

		// 인증 방법 선택 이벤트
		mixpanelAdapter.track(MIXPANEL_EVENTS.AUTH_METHOD_SELECTED, {
			auth_method: AUTH_METHODS.PASS,
			is_retry: passRetryCount > 0,
			retry_count: passRetryCount,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		// 재시도인 경우 추가 이벤트
		if (passRetryCount > 0 && passLastFailureReason) {
			mixpanelAdapter.track(MIXPANEL_EVENTS.AUTH_RETRY_ATTEMPTED, {
				auth_method: AUTH_METHODS.PASS,
				retry_count: passRetryCount,
				previous_failure_reason: passLastFailureReason,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
		}

		mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_AUTH_STARTED, {
			auth_method: 'pass',
			is_retry: passRetryCount > 0,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
		authEvents.trackLoginStarted('pass');
		signupEvents.trackSignupStarted();

		clearError();
		try {
			await startPortOneLogin();

			const loginDuration = Date.now() - loginStartTime;
			authEvents.trackLoginCompleted('pass', loginDuration);
		} catch (error) {
			setPassRetryCount((prev) => prev + 1);
			setPassLastFailureReason('authentication_error');
			authEvents.trackLoginFailed('pass', 'authentication_error');
		}
	};

	if (showMobileAuth && mobileAuthRequest && Platform.OS !== 'web') {
		return (
			<MobileIdentityVerification
				request={mobileAuthRequest}
				onComplete={handleMobileAuthComplete}
				onError={handleMobileAuthError}
				onCancel={handleMobileAuthCancel}
			/>
		);
	}

	const isIOS = Platform.OS === 'ios';
	const isAndroidOrWeb = Platform.OS === 'android' || Platform.OS === 'web';

	return (
		<View style={loginFormStyles.container}>
			<SometimeLogo showSubtitle={false} />

			<View style={loginFormStyles.universityLogos}>
				<UniversityLogos logoSize={64} country="kr" />
			</View>

			<View style={loginFormStyles.slideToAboutWrapper}>
				<SlideToAbout onAction={() => router.push('/onboarding?source=login')} />
			</View>

			<SignupFastBadge />

			<View style={loginFormStyles.buttonsContainer}>
				<View style={loginFormStyles.buttonWrapper}>
					<KakaoLoginComponent />
				</View>

				<Show when={isAndroidOrWeb}>
					<View style={loginFormStyles.buttonWrapper}>
						<Pressable
							onPress={onPressPassLogin}
							disabled={isLoading}
							style={[passStyles.button, { opacity: isLoading ? 0.6 : 1 }]}
						>
							{isLoading ? (
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
									<ActivityIndicator size="small" color="#FFFFFF" />
									<Text
										textColor="white"
										size="16"
										weight="semibold"
										style={{ textAlign: 'center' }}
									>
										{t('features.signup.ui.login_form.pass_loading')}
									</Text>
								</View>
							) : (
								<Text textColor="white" size="16" weight="semibold" style={{ textAlign: 'center' }}>
									{t('features.signup.ui.login_form.pass_login')}
								</Text>
							)}
						</Pressable>
					</View>
				</Show>

				<Show when={isIOS}>
					<View style={loginFormStyles.dividerContainer}>
						<View style={loginFormStyles.dividerLine} />
						<Text size="sm" style={loginFormStyles.dividerText}>
							{t('features.signup.ui.login_form.divider_or')}
						</Text>
						<View style={loginFormStyles.dividerLine} />
					</View>
					<SocialLoginIcons onPressPass={onPressPassLogin} isPassLoading={isLoading} />
				</Show>
			</View>

			{typeof error === 'string' && error && (
				<View style={loginFormStyles.errorMessage}>
					<Text size="sm" style={{ color: '#DC2626', textAlign: 'center' }}>
						{error}
					</Text>
				</View>
			)}

			<View style={loginFormStyles.privacyNotice}>
				<PrivacyNotice />
			</View>
		</View>
	);
}

const loginFormStyles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
	},
	universityLogos: {
		marginBottom: 24,
	},
	slideToAboutWrapper: {
		width: 330,
		marginBottom: 24,
	},
	buttonsContainer: {
		width: '100%',
		alignItems: 'center',
		flexDirection: 'column',
	},
	buttonWrapper: {
		marginBottom: 15,
	},
	dividerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		width: 330,
		marginVertical: 16,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#E0E0E0',
	},
	dividerText: {
		marginHorizontal: 12,
		color: '#999999',
	},
	errorMessage: {
		width: '100%',
		paddingHorizontal: 24,
		marginTop: 16,
	},
	privacyNotice: {
		width: '100%',
		paddingHorizontal: 24,
		marginTop: 'auto',
		paddingTop: 24,
		marginBottom: 8,
	},
});
function KakaoLoginComponent() {
	const { t } = useTranslation();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const [lastFailureReason, setLastFailureReason] = useState<string | null>(null);
	const { authEvents, signupEvents } = useMixpanel();
	const { loginWithKakaoNative } = useAuth();
	const { showModal } = useModal();
	const authStartTimeRef = useRef<number | null>(null);
	const { setAuthMethod } = useSignupProgress();

	const KAKAO_CLIENT_ID = env.KAKAO_LOGIN_API_KEY;
	const redirectUri = env.KAKAO_REDIRECT_URI;

	const isUserCancellation = (error: unknown): boolean => {
		if (error instanceof Error) {
			const message = error.message.toLowerCase();
			return message.includes('cancel') || message.includes('user') || message.includes('취소');
		}
		const errorObj = error as { code?: string; errorCode?: string };
		const code = errorObj?.code || errorObj?.errorCode;
		return code === 'CANCELED' || code === 'USER_CANCELED' || code === 'E_CANCELLED_OPERATION';
	};

	const handleNativeKakaoLogin = async () => {
		const loginStartTime = Date.now();
		authStartTimeRef.current = loginStartTime;

		try {
			setIsLoading(true);
			devLogWithTag('Kakao Login', '1. SDK 호출');

			// 카카오 네이티브 SDK로 로그인
			const result = await KakaoLogin.login();
			devLogWithTag('Kakao Login', '2. SDK 응답 받음', {
				hasAccessToken: !!result.accessToken,
			});

			if (!result.accessToken) {
				throw new Error('Failed to get Kakao access token');
			}

			devLogWithTag('Kakao Login', '3. 백엔드 API 호출');
			// 백엔드로 accessToken 전송
			const loginResult = await loginWithKakaoNative(result.accessToken);
			devLogWithTag('Kakao Login', '4. 백엔드 응답', {
				isNewUser: loginResult.isNewUser,
			});

			authStartTimeRef.current = null;
			if (loginResult.isNewUser) {
				if (loginResult.certificationInfo?.phone) {
					try {
						const { isBlacklisted } = await checkPhoneNumberBlacklist(
							loginResult.certificationInfo?.phone,
						);

						if (isBlacklisted) {
							showModal({
								title: t('features.signup.ui.login_form.registration_restricted_title'),
								children: t('features.signup.ui.login_form.registration_restricted_message'),
								primaryButton: {
									text: t('features.signup.ui.login_form.confirm_button'),
									onClick: () => {
										router.replace('/');
									},
								},
							});
							return;
						}
					} catch (error) {
						console.error('블랙리스트 체크 오류:', error);
						router.replace('/');
						return;
					}
				}

				const birthday = loginResult.certificationInfo?.birthday;

				if (birthday && !isAdult(birthday)) {
					router.push('/auth/age-restriction');
					return;
				}

				// 보안: certificationInfo를 AsyncStorage에 저장 (URL에 노출 방지)
				await AsyncStorage.setItem(
					'signup_certification_info',
					JSON.stringify({
						...loginResult.certificationInfo,
						loginType: 'kakao_native',
						kakaoAccessToken: result.accessToken,
					}),
				);

				router.push('/auth/signup/university');
			} else {
				const loginDuration = Date.now() - loginStartTime;
				authEvents.trackLoginCompleted('kakao', loginDuration);

				router.push('/home');
			}
		} catch (error: unknown) {
			const errorObj = error as {
				constructor?: { name?: string };
				status?: number;
				code?: string;
				errorCode?: string;
				data?: unknown;
				response?: { data?: unknown };
				message?: string;
			};
			const errorInfo = {
				type: errorObj?.constructor?.name || 'Unknown',
				message: error instanceof Error ? error.message : String(error),
				status: errorObj?.status,
				code: errorObj?.code || errorObj?.errorCode,
				data: errorObj?.data || errorObj?.response?.data,
			};

			console.error('===== 카카오 로그인 에러 상세 정보 =====');
			console.error('에러 정보:', JSON.stringify(errorInfo, null, 2));
			console.error('=======================================');

			const timeSpentSeconds = authStartTimeRef.current
				? Math.round((Date.now() - authStartTimeRef.current) / 1000)
				: undefined;
			authStartTimeRef.current = null;

			if (isUserCancellation(error)) {
				authEvents.trackLoginAbandoned(AUTH_METHODS.KAKAO, LOGIN_ABANDONED_STEPS.USER_CANCELLED, {
					timeSpentSeconds,
				});
				return;
			}

			authEvents.trackLoginFailed('kakao', errorInfo.code || 'authentication_error');

			// 재시도 카운터 증가 및 실패 이유 저장
			setRetryCount((prev) => prev + 1);
			setLastFailureReason(errorInfo.code || 'authentication_error');

			// 인증 에러 상세 이벤트
			let errorType = 'unknown';
			if (errorInfo.status === undefined || !errorInfo.status) {
				errorType = 'network';
			} else if (errorInfo.status >= 500) {
				errorType = 'network';
			} else if (errorInfo.status === 401 || errorInfo.status === 403) {
				errorType = 'certificate_expired';
			}

			mixpanelAdapter.track(MIXPANEL_EVENTS.AUTH_VERIFICATION_ERROR, {
				auth_method: AUTH_METHODS.KAKAO,
				error_type: errorType,
				error_code: errorInfo.code,
				error_message: errorInfo.message,
				platform: Platform.OS,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});

			let errorMessage = '';
			let showRetryButton = false;

			if (errorInfo.status === undefined || !errorInfo.status) {
				errorMessage = '서버에 연결할 수 없습니다.\n네트워크 연결을 확인하고 다시 시도해주세요.';
				showRetryButton = true;
			} else if (errorInfo.status >= 500) {
				errorMessage = '서버에 일시적인 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.';
				showRetryButton = true;
			} else if (errorInfo.status === 401 || errorInfo.status === 403) {
				errorMessage = '카카오 인증에 실패했습니다.\n다시 로그인을 시도해주세요.';
				showRetryButton = true;
			} else {
				errorMessage = t('features.signup.ui.login_form.login_failed_message');
			}

			showModal({
				title: t('features.signup.ui.login_form.login_failed_title'),
				children: errorMessage,
				primaryButton: showRetryButton
					? {
							text: t('retry'),
							onClick: () => handleNativeKakaoLogin(),
						}
					: {
							text: t('features.signup.ui.login_form.confirm_button'),
							onClick: () => {},
						},
				secondaryButton: showRetryButton
					? {
							text: t('close'),
							onClick: () => {},
						}
					: undefined,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleWebKakaoLogin = () => {
		// 웹에서는 기존 방식 유지
		const scope = ['name', 'gender', 'birthyear', 'birthday', 'phone_number'].join(' ');

		const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
			redirectUri,
		)}&response_type=code&scope=${encodeURIComponent(scope)}`;

		if (Platform.OS === 'web') {
			window.location.href = kakaoAuthUrl;
		}
	};

	const handleKakaoLogin = () => {
		setAuthMethod(AUTH_METHODS.KAKAO);

		// 인증 방법 선택 이벤트
		mixpanelAdapter.track(MIXPANEL_EVENTS.AUTH_METHOD_SELECTED, {
			auth_method: AUTH_METHODS.KAKAO,
			is_retry: retryCount > 0,
			retry_count: retryCount,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		// 재시도인 경우 추가 이벤트
		if (retryCount > 0 && lastFailureReason) {
			mixpanelAdapter.track(MIXPANEL_EVENTS.AUTH_RETRY_ATTEMPTED, {
				auth_method: AUTH_METHODS.KAKAO,
				retry_count: retryCount,
				previous_failure_reason: lastFailureReason,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
		}

		mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_AUTH_STARTED, {
			auth_method: 'kakao',
			is_retry: retryCount > 0,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
		authEvents.trackLoginStarted('kakao');
		signupEvents.trackSignupStarted();
		if (Platform.OS === 'web') {
			handleWebKakaoLogin();
		} else {
			handleNativeKakaoLogin();
		}
	};

	return (
		<View style={kakaoStyles.container}>
			<Pressable
				onPress={handleKakaoLogin}
				disabled={isLoading}
				style={[kakaoStyles.button, { opacity: isLoading ? 0.6 : 1 }]}
			>
				{isLoading ? (
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
						<ActivityIndicator size="small" color="#3C1E1E" />
						<Text textColor="black" size="18" weight="semibold">
							{t('features.signup.ui.login_form.kakao_login_loading')}
						</Text>
					</View>
				) : (
					<>
						<View
							style={{ width: 34, height: 34 }}
							accessibilityLabel={t('ui.카카오_로고')}
							accessibilityRole="image"
						>
							<KakaoLogo width={34} height={34} aria-label={t('ui.카카오')} role="img" />
						</View>
						<View>
							<Text textColor="black" size="18" weight="semibold">
								{t('features.signup.ui.login_form.kakao_login')}
							</Text>
						</View>
					</>
				)}
			</Pressable>
		</View>
	);
}

const kakaoStyles = StyleSheet.create({
	container: {
		width: '100%',
	},
	button: {
		width: 330,
		height: 50,
		borderRadius: 47,
		backgroundColor: '#FEE500',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
});

const passStyles = StyleSheet.create({
	button: {
		width: 330,
		height: 50,
		borderRadius: 20,
		backgroundColor: '#FF3A4A',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
