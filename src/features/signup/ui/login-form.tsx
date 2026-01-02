import { MobileIdentityVerification, usePortOneLogin } from '@/src/features/pass';
import { Button, Show, SlideUnlock, SlideToAbout, Text, AppDownloadSection } from '@/src/shared/ui';
import { useMixpanel } from '@/src/shared/hooks';
import { env } from '@/src/shared/libs/env';
import KakaoLogo from '@assets/icons/kakao-logo.svg';
import * as Localization from 'expo-localization';
import { router, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
	Platform,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../auth';
import { PrivacyNotice } from '../../auth/ui/privacy-notice';
import AppleLoginButton from './apple-login-button';
import UniversityLogos from './university-logos';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/shared/libs/i18n';
import * as KakaoLogin from '@react-native-kakao/user';
import { checkPhoneNumberBlacklist } from '../apis';
import { isAdult } from '@/src/features/pass/utils';
import { useModal } from '@/src/shared/hooks/use-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { devLogWithTag } from '@/src/shared/utils';
import { isJapanese } from '@/src/shared/libs/local';

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

	const onPressPassLogin = async () => {
		const loginStartTime = Date.now();

		authEvents.trackLoginStarted('pass');
		signupEvents.trackSignupStarted();

		clearError();
		try {
			await startPortOneLogin();

			const loginDuration = Date.now() - loginStartTime;
			authEvents.trackLoginCompleted('pass', loginDuration);
		} catch (error) {
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

	return (
		<View style={loginFormStyles.container}>
			<View style={loginFormStyles.universityLogos}>
				<UniversityLogos logoSize={64} country="kr" />
			</View>

			<Show when={Platform.OS === 'web'}>
				<AppDownloadSection
					size="sm"
					onAppStorePress={() => {
						if (Platform.OS === 'web') {
							window.open(
								'https://apps.apple.com/kr/app/%EC%8D%B8%ED%83%80%EC%9E%84-%EC%A7%80%EC%97%AD-%EB%8C%80%ED%95%99%EC%83%9D-%EC%86%8C%EA%B0%9C%ED%8C%85/id6746120889?l=en-GB',
								'_blank',
							);
						}
					}}
					onGooglePlayPress={() => {
						if (Platform.OS === 'web') {
							window.open(
								'https://play.google.com/store/apps/details?id=com.smartnewb.sometimes&hl=ko&pli=1',
								'_blank',
							);
						}
					}}
				/>
			</Show>

			<View style={loginFormStyles.slideToAboutWrapper}>
				<SlideToAbout onAction={() => router.push('/onboarding?source=login')} />
			</View>

			<View style={loginFormStyles.buttonsContainer}>
				<View style={loginFormStyles.buttonWrapper}>
					<Button
						variant="primary"
						size="lg"
						rounded="full"
						onPress={onPressPassLogin}
						disabled={isLoading}
						styles={{
							width: 330,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{isLoading ? (
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
								<ActivityIndicator size="small" color="#FFFFFF" />
								<Text
									textColor="white"
									size="18"
									weight="semibold"
									style={{ lineHeight: 40, textAlign: 'center' }}
								>
									{t('features.signup.ui.login_form.pass_loading')}
								</Text>
							</View>
						) : (
							<Text
								textColor="white"
								size="18"
								weight="semibold"
								style={{ lineHeight: 40, textAlign: 'center' }}
							>
								{t('features.signup.ui.login_form.pass_login')}
							</Text>
						)}
					</Button>
				</View>

				<View style={loginFormStyles.buttonWrapper}>
					<KakaoLoginComponent />
				</View>

				<Show when={Platform.OS === 'ios'}>
					<View>
						<AppleLoginButton />
					</View>
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
	errorMessage: {
		width: '100%',
		paddingHorizontal: 24,
		marginTop: 16,
	},
	privacyNotice: {
		width: '100%',
		paddingHorizontal: 24,
		marginTop: 24,
	},
});
function KakaoLoginComponent() {
	const { t } = useTranslation();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { authEvents, signupEvents } = useMixpanel();
	const { loginWithKakaoNative } = useAuth();
	const { showModal } = useModal();

	const KAKAO_CLIENT_ID = env.KAKAO_LOGIN_API_KEY;
	const redirectUri = env.KAKAO_REDIRECT_URI;

	const handleNativeKakaoLogin = async () => {
		const loginStartTime = Date.now();

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
		} catch (error: any) {
			const errorInfo = {
				type: error?.constructor?.name || 'Unknown',
				message: error instanceof Error ? error.message : String(error),
				status: error?.status,
				code: error?.code || error?.errorCode,
				data: error?.data || error?.response?.data,
			};

			console.error('===== 카카오 로그인 에러 상세 정보 =====');
			console.error('에러 정보:', JSON.stringify(errorInfo, null, 2));
			console.error('=======================================');

			authEvents.trackLoginFailed('kakao', errorInfo.code || 'authentication_error');

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
		height: 60,
		borderRadius: 30,
		backgroundColor: '#FEE500',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		paddingVertical: 16,
	},
});
