import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { MobileIdentityVerification, usePortOneLogin } from '@/src/features/pass';
import { isAdult } from '@/src/features/pass/utils';
import { checkPhoneNumberBlacklist } from '@/src/features/signup/apis';
import useSignupProgress from '@/src/features/signup/hooks/use-signup-progress';
import colors from '@/src/shared/constants/colors';
import { AUTH_METHODS, MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { Text } from '@/src/shared/ui';
import KakaoLogo from '@assets/icons/kakao-logo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as KakaoLogin from '@react-native-kakao/user';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mascotImage = require('@assets/images/info-miho.webp');

interface AuthBottomSheetProps {
	sessionId: string | null;
	onClose: () => void;
	onAuthComplete: () => void;
}

export function AuthBottomSheet({ sessionId, onClose, onAuthComplete }: AuthBottomSheetProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { loginWithKakaoNative } = useAuth();
	const { showModal } = useModal();
	const { setAuthMethod } = useSignupProgress();
	const [isKakaoLoading, setIsKakaoLoading] = useState(false);
	const authStartTimeRef = useRef<number | null>(null);

	const signupPath = `/auth/signup/university?idealTypeSessionId=${sessionId}`;

	const {
		startPortOneLogin,
		isLoading: isPassLoading,
		showMobileAuth,
		mobileAuthRequest,
		handleMobileAuthComplete,
		handleMobileAuthError,
		handleMobileAuthCancel,
	} = usePortOneLogin({
		signupPath,
		onSuccess: (isNewUser) => {
			if (isNewUser) {
				onAuthComplete();
			} else {
				onAuthComplete();
			}
		},
	});

	const handleKakaoLogin = async () => {
		setAuthMethod(AUTH_METHODS.KAKAO);
		authStartTimeRef.current = Date.now();

		mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_AUTH_STARTED, {
			auth_method: 'kakao',
			source: 'ideal_type_test_result',
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		try {
			setIsKakaoLoading(true);

			const result = await KakaoLogin.login();
			if (!result.accessToken) {
				throw new Error('Failed to get Kakao access token');
			}

			const loginResult = await loginWithKakaoNative(result.accessToken);
			authStartTimeRef.current = null;

			if (loginResult.isNewUser) {
				if (loginResult.certificationInfo?.phone) {
					try {
						const { isBlacklisted } = await checkPhoneNumberBlacklist(
							loginResult.certificationInfo.phone,
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
						console.error('Blacklist check error:', error);
						router.replace('/');
						return;
					}
				}

				const birthday = loginResult.certificationInfo?.birthday;
				if (birthday && !isAdult(birthday)) {
					// biome-ignore lint/suspicious/noExplicitAny: expo-router type
					router.push('/auth/age-restriction' as any);
					return;
				}

				await AsyncStorage.setItem(
					'signup_certification_info',
					JSON.stringify({
						...loginResult.certificationInfo,
						loginType: 'kakao_native',
						kakaoAccessToken: result.accessToken,
					}),
				);

				onAuthComplete();
				// biome-ignore lint/suspicious/noExplicitAny: dynamic signup path
				router.push(signupPath as any);
			} else {
				onAuthComplete();
				router.replace('/home');
			}
		} catch (error: unknown) {
			const isCancel =
				error instanceof Error &&
				(error.message.toLowerCase().includes('cancel') ||
					error.message.toLowerCase().includes('취소'));
			if (isCancel) return;

			console.error('Kakao login error:', error);
		} finally {
			setIsKakaoLoading(false);
		}
	};

	const handlePassLogin = async () => {
		setAuthMethod(AUTH_METHODS.PASS);

		mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_AUTH_STARTED, {
			auth_method: 'pass',
			source: 'ideal_type_test_result',
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		await startPortOneLogin();
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

	const isAndroidOrWeb = Platform.OS === 'android' || Platform.OS === 'web';

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
			<View style={styles.handleBar} />

			<Image source={mascotImage} style={styles.mascot} resizeMode="contain" />

			<Text size="20" weight="bold" textColor="black" style={styles.title}>
				{t('features.ideal-type-test.result.auth_modal_title')}
			</Text>
			<Text size="14" weight="medium" style={styles.subtitle}>
				{t('features.ideal-type-test.result.auth_modal_subtitle')}
			</Text>

			<View style={styles.buttonsContainer}>
				{/* Kakao Login */}
				<Pressable
					onPress={handleKakaoLogin}
					disabled={isKakaoLoading}
					style={[styles.kakaoButton, { opacity: isKakaoLoading ? 0.6 : 1 }]}
				>
					{isKakaoLoading ? (
						<ActivityIndicator size="small" color="#3C1E1E" />
					) : (
						<>
							<KakaoLogo width={28} height={28} />
							<Text textColor="black" size="16" weight="semibold">
								{t('features.signup.ui.login_form.kakao_login')}
							</Text>
						</>
					)}
				</Pressable>

				{/* PASS Login - Android/Web only */}
				{isAndroidOrWeb && (
					<Pressable
						onPress={handlePassLogin}
						disabled={isPassLoading}
						style={[styles.passButton, { opacity: isPassLoading ? 0.6 : 1 }]}
					>
						{isPassLoading ? (
							<ActivityIndicator size="small" color="#FFFFFF" />
						) : (
							<Text textColor="white" size="16" weight="semibold">
								{t('features.signup.ui.login_form.pass_login')}
							</Text>
						)}
					</Pressable>
				)}
			</View>

			<Pressable onPress={onClose} style={styles.closeLink}>
				<Text size="14" weight="medium" style={styles.closeText}>
					{t('features.ideal-type-test.result.dismiss_button')}
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 24,
		paddingTop: 12,
		alignItems: 'center',
	},
	handleBar: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: '#D9D9D9',
		marginBottom: 20,
	},
	mascot: {
		width: 80,
		height: 80,
		marginBottom: 16,
	},
	title: {
		textAlign: 'center',
		marginBottom: 6,
	},
	subtitle: {
		textAlign: 'center',
		color: semanticColors.text.secondary,
		marginBottom: 24,
	},
	buttonsContainer: {
		width: '100%',
		gap: 12,
		alignItems: 'center',
	},
	kakaoButton: {
		width: 330,
		height: 50,
		borderRadius: 47,
		backgroundColor: '#FEE500',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	passButton: {
		width: 330,
		height: 50,
		borderRadius: 20,
		backgroundColor: '#FF3A4A',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeLink: {
		marginTop: 20,
		paddingVertical: 8,
	},
	closeText: {
		color: '#939598',
		textDecorationLine: 'underline',
	},
});
