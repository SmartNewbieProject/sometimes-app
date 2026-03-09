import { isAdult } from '@/src/features/pass/utils';
import {
	AUTH_METHODS,
	LOGIN_ABANDONED_STEPS,
	MIXPANEL_EVENTS,
} from '@/src/shared/constants/mixpanel-events';
import { useMixpanel } from '@/src/shared/hooks';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useToast } from '@/src/shared/hooks/use-toast';
import { env } from '@/src/shared/libs/env';
import { isJapanese } from '@/src/shared/libs/local';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { Button, Show, SlideToAbout, Text } from '@/src/shared/ui';
import { devLogWithTag } from '@/src/shared/utils';
import KakaoLogo from '@assets/icons/kakao-logo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as KakaoLogin from '@react-native-kakao/user';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	AppState,
	Platform,
	Pressable,
	Text as RNText,
	StyleSheet,
	View,
} from 'react-native';
import { useAuth } from '../../auth';
import { PrivacyNotice } from '../../auth/ui/privacy-notice';
import { checkPhoneNumberBlacklist } from '../apis';
import useSignupProgress from '../hooks/use-signup-progress';
import AppleLoginButton from './apple-login-button';
import { RollingHookMessage } from './rolling-hook-message';
import { SignupFastBadge } from './signup-fast-badge';
import { SocialLoginIcons } from './social-login-icons';
import UniversityLogos from './university-logos';

/**
 * 로그인 폼 - JP/KR 분기 처리
 * - JP: SMS 인증 + Apple 로그인
 * - KR: Kakao + Apple 로그인
 */
export default function LoginForm() {
	if (isJapanese()) {
		return <JpLoginForm />;
	}
	return <KrLoginForm />;
}

/** 상단 콘텐츠 (ScrollView 안에 렌더링) — KR/JP 공통 구조 */
export function LoginFormContent() {
	const router = useRouter();
	const country = isJapanese() ? 'jp' : 'kr';
	return (
		<View style={loginFormStyles.container}>
			<View style={loginFormStyles.universityLogos}>
				<UniversityLogos country={country} />
			</View>
			<View style={loginFormStyles.slideToAboutWrapper}>
				<SlideToAbout onAction={() => router.push('/onboarding?source=login')} />
			</View>
		</View>
	);
}

/** 하단 CTA 버튼 (fixed bottom에 렌더링) */
export function LoginFormButtons() {
	if (isJapanese()) {
		return <JpLoginFormButtons />;
	}
	return <KrLoginFormButtons />;
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
 * KR 로그인 폼 - Kakao + Apple 로그인
 */
function KrLoginForm() {
	const { t } = useTranslation();
	const router = useRouter();

	const isIOS = Platform.OS === 'ios';

	return (
		<View style={loginFormStyles.container}>
			<View style={loginFormStyles.universityLogos}>
				<UniversityLogos logoSize={64} country="kr" />
			</View>

			<View style={loginFormStyles.slideToAboutWrapper}>
				<SlideToAbout onAction={() => router.push('/onboarding?source=login')} />
			</View>

			<SignupFastBadge style={{ position: 'absolute', top: -52 }} />

			<View style={loginFormStyles.buttonsContainer}>
				<View style={loginFormStyles.buttonWrapper}>
					<KakaoLoginComponent />
				</View>

				{__DEV__ && (
					<View style={loginFormStyles.buttonWrapper}>
						<DevLoginButton />
					</View>
				)}

				<Show when={isIOS}>
					<View style={loginFormStyles.dividerContainer}>
						<View style={loginFormStyles.dividerLine} />
						<Text size="sm" style={loginFormStyles.dividerText}>
							{t('features.signup.ui.login_form.divider_or')}
						</Text>
						<View style={loginFormStyles.dividerLine} />
					</View>
					<SocialLoginIcons />
				</Show>
			</View>

			<View style={loginFormStyles.privacyNotice}>
				<PrivacyNotice />
			</View>
		</View>
	);
}

const loginFormStyles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	universityLogos: {
		marginBottom: 12,
	},
	slideToAboutWrapper: {
		width: 330,
		marginBottom: 12,
	},
	buttonsContainer: {
		width: '100%',
		alignItems: 'center',
		flexDirection: 'column',
	},
	buttonWrapper: {
		marginBottom: 15,
		alignItems: 'center',
	},
	kakaoCaption: {
		width: 330,
		marginTop: 6,
		color: '#997700',
		textAlign: 'center',
		alignSelf: 'center',
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
		marginTop: 12,
		paddingTop: 8,
		marginBottom: 4,
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
	const { emitToast } = useToast();
	const authStartTimeRef = useRef<number | null>(null);
	const isKakaoLoginPendingRef = useRef(false);
	const isCancelledRef = useRef(false);
	const isWebOAuthRef = useRef(false);
	const appStateRef = useRef(AppState.currentState);
	const { setAuthMethod } = useSignupProgress();

	// 카카오 인증 중 앱이 백그라운드로 갔다가 복귀하면 로딩 상태를 즉시 해제
	// Android: KakaoTalk 앱 로그인 시 background→active는 정상 성공 흐름이므로 취소 처리하지 않음
	// iOS 네이티브 KakaoTalk: 앱 전환 후 복귀 시 SDK가 영구 대기할 수 있어 취소 처리
	// iOS 웹 OAuth(카카오톡 미설치): 앱 전환이 정상 플로우이므로 취소하지 않음
	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState) => {
			const prevState = appStateRef.current;
			appStateRef.current = nextState;

			if (prevState === 'background' && nextState === 'active' && isKakaoLoginPendingRef.current) {
				if (Platform.OS === 'ios' && !isWebOAuthRef.current) {
					isCancelledRef.current = true;
					isKakaoLoginPendingRef.current = false;
					setIsLoading(false);
				}
			}
		});
		return () => subscription.remove();
	}, []);

	const isInstagramIAB = () => {
		if (Platform.OS !== 'web') return false;
		const ua = navigator.userAgent;
		return /Instagram|FBAN|FBAV/.test(ua);
	};

	const showInstagramIOSGuide = isInstagramIAB();

	const handleCopyLink = () => {
		navigator.clipboard?.writeText(window.location.href).catch(() => {});
		emitToast('링크가 복사되었어요. Safari를 열고 주소창에 붙여넣어 주세요.');
	};

	const KAKAO_CLIENT_ID = env.KAKAO_LOGIN_API_KEY;
	const redirectUri = env.KAKAO_REDIRECT_URI;

	const CERT_TO_SCOPE_MAP: Record<string, string[]> = {
		name: ['name'],
		phone: ['phone_number'],
		gender: ['gender'],
		birthday: ['birthday', 'birthyear'],
	};

	const isUserCancellation = (error: unknown): boolean => {
		if (error instanceof Error) {
			const message = error.message.toLowerCase();
			return (
				message.includes('cancel') ||
				message.includes('취소') ||
				message.includes('user_canceled') ||
				message.includes('user_cancelled') ||
				message === 'user canceled' ||
				message === 'user cancelled'
			);
		}
		const errorObj = error as { code?: string; errorCode?: string };
		const code = errorObj?.code || errorObj?.errorCode;
		return code === 'CANCELED' || code === 'USER_CANCELED' || code === 'E_CANCELLED_OPERATION';
	};

	const requestAdditionalConsent = async (
		missingScopes: string[],
	): Promise<KakaoLogin.KakaoLoginToken | null> => {
		try {
			const token = await KakaoLogin.login({
				scopes: missingScopes,
				useKakaoAccountLogin: true,
			});
			return token;
		} catch (error) {
			if (isUserCancellation(error)) return null;
			throw error;
		}
	};

	const handleNativeKakaoLogin = async () => {
		const loginStartTime = Date.now();
		authStartTimeRef.current = loginStartTime;
		isCancelledRef.current = false;
		isWebOAuthRef.current = false;
		isKakaoLoginPendingRef.current = true;

		try {
			setIsLoading(true);
			devLogWithTag('Kakao Login', '1. SDK 호출');

			// ── 1단계: 카카오 SDK 호출 (SDK 에러 별도 처리) ──────────────────
			// eslint-disable-next-line prefer-const
			let result!: KakaoLogin.KakaoLoginToken;
			try {
				// KakaoTalk 앱이 설치된 경우 앱으로 로그인, 없으면 웹(카카오계정)으로 폴백
				const isTalkAvailable = Platform.OS === 'ios'
					? await KakaoLogin.isKakaoTalkLoginAvailable()
					: true;
				isWebOAuthRef.current = !isTalkAvailable;
				result = await KakaoLogin.login({ useKakaoAccountLogin: !isTalkAvailable });
			} catch (sdkError: unknown) {
				if (isUserCancellation(sdkError)) {
					const timeSpentSeconds = authStartTimeRef.current
						? Math.round((Date.now() - authStartTimeRef.current) / 1000)
						: undefined;
					authStartTimeRef.current = null;
					authEvents.trackLoginAbandoned(AUTH_METHODS.KAKAO, LOGIN_ABANDONED_STEPS.USER_CANCELLED, {
						timeSpentSeconds,
					});
					return;
				}

				const sdkErrorObj = sdkError as { code?: string; errorCode?: string; message?: string };
				const sdkCode = sdkErrorObj?.code || sdkErrorObj?.errorCode || 'UNKNOWN';
				const sdkMessage = sdkError instanceof Error ? sdkError.message : String(sdkError);

				console.error('===== 카카오 SDK 에러 =====');
				console.error(JSON.stringify({ code: sdkCode, message: sdkMessage }, null, 2));
				console.error('==========================');

				authStartTimeRef.current = null;
				authEvents.trackLoginFailed('kakao', sdkCode);
				mixpanelAdapter.track(MIXPANEL_EVENTS.AUTH_VERIFICATION_ERROR, {
					auth_method: AUTH_METHODS.KAKAO,
					error_type: 'kakao_sdk_error',
					error_code: sdkCode,
					error_message: sdkMessage,
					platform: Platform.OS,
					env: process.env.EXPO_PUBLIC_TRACKING_MODE,
				});

				showModal({
					title: t('features.signup.ui.login_form.login_failed_title'),
					children: `카카오 인증에 실패했습니다.\n(${sdkCode}: ${sdkMessage})`,
					primaryButton: {
						text: t('retry'),
						onClick: () => handleNativeKakaoLogin(),
					},
					secondaryButton: {
						text: t('close'),
						onClick: () => {},
					},
				});
				return;
			}
			// ─────────────────────────────────────────────────────────────────

			// 앱 복귀로 인해 취소 처리된 경우 이후 플로우 생략
			if (isCancelledRef.current) return;

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
				// 카카오 동의 거부로 필수 정보 누락 추적
				let cert = loginResult.certificationInfo;
				let currentLoginResult = loginResult;
				let currentAccessToken = result.accessToken;
				const missingFields = [
					!cert?.name && 'name',
					!cert?.phone && 'phone',
					!cert?.gender && 'gender',
					!cert?.birthday && 'birthday',
				].filter(Boolean) as string[];

				if (missingFields.length > 0) {
					mixpanelAdapter.track(MIXPANEL_EVENTS.AUTH_VERIFICATION_ERROR, {
						auth_method: AUTH_METHODS.KAKAO,
						error_type: 'consent_denied',
						error_code: 'missing_required_fields',
						error_message: `Missing: ${missingFields.join(', ')}`,
						platform: Platform.OS,
						env: process.env.EXPO_PUBLIC_TRACKING_MODE,
					});

					// 누락된 필드에 해당하는 scope 목록 생성
					const missingScopes = missingFields.flatMap((field) => CERT_TO_SCOPE_MAP[field] || []);

					// 재동의 요청 (카카오계정 웹 로그인으로 강제됨)
					const reConsentResult = await requestAdditionalConsent(missingScopes);

					if (!reConsentResult) {
						// 재거부 → 가입 차단 모달
						showModal({
							title: t('features.signup.ui.login_form.consent_required_title'),
							children: t('features.signup.ui.login_form.consent_required_message'),
							primaryButton: {
								text: t('features.signup.ui.login_form.confirm_button'),
								onClick: () => {},
							},
						});
						return;
					}

					// 새 토큰으로 백엔드 재호출
					currentAccessToken = reConsentResult.accessToken;
					currentLoginResult = await loginWithKakaoNative(currentAccessToken);
					cert = currentLoginResult.certificationInfo;

					// 여전히 누락이면 차단
					const stillMissing = [
						!cert?.name && 'name',
						!cert?.phone && 'phone',
						!cert?.gender && 'gender',
						!cert?.birthday && 'birthday',
					].filter(Boolean);

					if (stillMissing.length > 0) {
						showModal({
							title: t('features.signup.ui.login_form.consent_retry_failed_title'),
							children: t('features.signup.ui.login_form.consent_retry_failed_message'),
							primaryButton: {
								text: t('features.signup.ui.login_form.confirm_button'),
								onClick: () => {},
							},
						});
						return;
					}
				}

				if (currentLoginResult.certificationInfo?.phone) {
					try {
						const { isBlacklisted } = await checkPhoneNumberBlacklist(
							currentLoginResult.certificationInfo?.phone,
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

				const birthday = currentLoginResult.certificationInfo?.birthday;

				if (birthday && !isAdult(birthday)) {
					router.push('/auth/age-restriction');
					return;
				}

				const loginDuration = Date.now() - loginStartTime;
				authEvents.trackLoginCompleted('kakao', loginDuration, true);

				// 보안: certificationInfo를 AsyncStorage에 저장 (URL에 노출 방지)
				await AsyncStorage.setItem(
					'signup_certification_info',
					JSON.stringify({
						...currentLoginResult.certificationInfo,
						loginType: 'kakao_native',
						kakaoAccessToken: currentAccessToken,
					}),
				);

				router.push('/auth/signup/university');
			} else {
				const loginDuration = Date.now() - loginStartTime;
				authEvents.trackLoginCompleted('kakao', loginDuration, false);

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
			isKakaoLoginPendingRef.current = false;
			isWebOAuthRef.current = false;
			setIsLoading(false);
		}
	};

	const handleWebKakaoLogin = () => {
		if (Platform.OS !== 'web') return;

		const scope = ['name', 'gender', 'birthyear', 'birthday', 'phone_number'].join(' ');
		const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
			redirectUri,
		)}&response_type=code&scope=${encodeURIComponent(scope)}`;

		// Instagram 인앱브라우저 + Android: intent:// scheme으로 Chrome 강제 오픈
		// (iOS는 진입 시 useEffect에서 안내 모달을 먼저 표시)
		if (isInstagramIAB()) {
			const isAndroid = /Android/.test(navigator.userAgent);
			if (isAndroid) {
				const intentUrl = [
					`intent://${kakaoAuthUrl.replace(/^https?:\/\//, '')}`,
					'#Intent',
					'scheme=https',
					'package=com.android.chrome',
					`S.browser_fallback_url=${encodeURIComponent(kakaoAuthUrl)}`,
					'end',
				].join(';');
				window.location.href = intentUrl;
				return;
			}
		}

		window.location.href = kakaoAuthUrl;
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
			{showInstagramIOSGuide && (
				<View style={kakaoStyles.iabGuideCard}>
					<RNText style={kakaoStyles.iabGuideTitle}>
						인스타그램 내부에서는 카카오 간편 로그인이 제한됩니다. Safari에서 열어주세요.
					</RNText>
					<Pressable onPress={handleCopyLink} style={kakaoStyles.iabGuideCta}>
						<RNText style={kakaoStyles.iabGuideCtaText}>링크 복사하기</RNText>
					</Pressable>
				</View>
			)}
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
		alignItems: 'center',
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
	iabGuideCard: {
		width: 330,
		flexDirection: 'column',
		gap: 5,
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 14,
		marginBottom: 10,
	},
	iabGuideTitle: {
		fontSize: 12,
		fontWeight: '700',
		color: '#E5E5E5',
		lineHeight: 17,
	},
	iabGuideDesc: {
		fontSize: 11,
		color: '#888',
		lineHeight: 16,
	},
	iabGuideCta: {
		alignSelf: 'flex-start',
	},
	iabGuideCtaText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#FEE500',
	},
});

function DevLoginButton() {
	const router = useRouter();
	const { loginWithPass } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleDevLogin = async () => {
		try {
			setIsLoading(true);
			const result = await loginWithPass('dev');

			if (result.isNewUser) {
				await AsyncStorage.setItem(
					'signup_certification_info',
					JSON.stringify(result.certificationInfo),
				);
				router.push('/auth/signup/university');
			} else {
				router.push('/home');
			}
		} catch (error) {
			console.error('Dev login error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Pressable
			onPress={handleDevLogin}
			disabled={isLoading}
			style={[devLoginStyles.button, { opacity: isLoading ? 0.6 : 1 }]}
		>
			{isLoading ? (
				<ActivityIndicator size="small" color="#FFFFFF" />
			) : (
				<RNText style={devLoginStyles.text}>DEV 로그인</RNText>
			)}
		</Pressable>
	);
}

const devLoginStyles = StyleSheet.create({
	button: {
		width: 330,
		height: 50,
		borderRadius: 47,
		backgroundColor: '#333333',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		borderWidth: 1,
		borderColor: '#555555',
		borderStyle: 'dashed',
	},
	text: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
});

// ─── 분리된 Content/Buttons 컴포넌트 ─────────────────────────────────────────

function KrLoginFormButtons() {
	const { t } = useTranslation();
	const isIOS = Platform.OS === 'ios';

	return (
		<View style={loginFormStyles.container}>
			<RollingHookMessage />
			<View style={loginFormStyles.buttonsContainer}>
				<Show when={isIOS}>
					<SocialLoginIcons />
					<View style={loginFormStyles.dividerContainer}>
						<View style={loginFormStyles.dividerLine} />
						<Text size="sm" style={loginFormStyles.dividerText}>
							{t('features.signup.ui.login_form.divider_or')}
						</Text>
						<View style={loginFormStyles.dividerLine} />
					</View>
				</Show>
				{__DEV__ && (
					<View style={loginFormStyles.buttonWrapper}>
						<DevLoginButton />
					</View>
				)}
				<View style={loginFormStyles.buttonWrapper}>
					<KakaoLoginComponent />
					<Text size="12" weight="medium" style={loginFormStyles.kakaoCaption}>
						{t('features.signup.ui.login_form.fast_signup_badge')}
					</Text>
				</View>
			</View>
			<View style={loginFormStyles.privacyNotice}>
				<PrivacyNotice />
			</View>
		</View>
	);
}

function JpLoginFormButtons() {
	const { t } = useTranslation();
	const router = useRouter();

	const handleSmsAuth = () => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_AUTH_STARTED, {
			auth_method: 'sms',
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
		router.push('/auth/jp-sms');
	};

	return (
		<View style={loginFormStyles.container}>
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
