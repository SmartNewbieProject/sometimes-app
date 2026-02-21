import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useIdealTypeTestPrompt } from '@/src/features/ideal-type-test/hooks';
import {
	AuthTabBar,
	type AuthTab,
} from '@/src/features/article/ui';
import { isAdult } from '@/src/features/pass/utils';
import { checkPhoneNumberBlacklist } from '@/src/features/signup/apis';
import { useModal } from '@/src/shared/hooks/use-modal';
import { resetAuthState } from '@/src/shared/libs/axios';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import Signup from '@features/signup';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

const { useSignupProgress } = Signup;

export default function LoginScreen() {
	const { clear } = useSignupProgress();
	const params = useLocalSearchParams();
	const router = useRouter();
	const { loginWithPass } = useAuth();
	const { showModal } = useModal();
	const { t } = useTranslation();
	const hasTrackedView = useRef(false);
	const insets = useSafeAreaInsets();
	useIdealTypeTestPrompt();

	const handleTabChange = (tab: AuthTab) => {
		if (tab === 'story') {
			router.replace('/auth/sometimes');
		}
	};

	useEffect(() => {
		resetAuthState();

		if (!hasTrackedView.current) {
			mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_LOGIN_VIEW, {
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
			hasTrackedView.current = true;
		}
	}, []);

	useEffect(() => {
		const identityVerificationId = params.identityVerificationId as string;
		if (identityVerificationId) {
			loginWithPass(identityVerificationId)
				.then(async (result) => {
					if (result.isNewUser) {
						const birthday = result.certificationInfo?.birthday;
						const phone = result.certificationInfo?.phone;
						if (birthday && !isAdult(birthday)) {
							router.replace('/auth/age-restriction');
							return;
						}
						if (phone) {
							try {
								const { isBlacklisted } = await checkPhoneNumberBlacklist(phone);

								if (isBlacklisted) {
									showModal({
										title: t('features.auth.redirect.limit_title'),
										children: t('features.auth.redirect.limit_description'),
										primaryButton: {
											text: t('shareds.utils.common.confirm'),
											onClick: () => {
												router.replace('/auth/login');
											},
										},
									});
									return;
								}
							} catch (error) {
								console.error('Blacklist check error:', error);
								router.replace('/auth/login');
								return;
							}
						}

						await AsyncStorage.setItem(
							'signup_certification_info',
							JSON.stringify(result.certificationInfo),
						);

						router.replace('/auth/signup/university');
					} else {
						router.replace('/home');
					}
				})
				.catch(() => router.replace('/auth/login'));
		}
	}, [params, loginWithPass, router, showModal]);

	useEffect(() => {
		clear();
		AsyncStorage.removeItem('signup_session');
		AsyncStorage.removeItem('signup_certification_info');
	}, [clear]);

	return (
		<View style={styles.container}>
			<LinearGradient colors={['#FFFFFF', '#F5F1FF']} style={styles.gradientContainer}>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					bounces={false}
				>
					<View style={[styles.contentWrapper, { paddingTop: insets.top }]}>
						<View style={styles.logoSection}>
							<Signup.Logo />
						</View>

						<View style={styles.mainContent}>
							<Signup.LoginForm />
						</View>
					</View>
				</ScrollView>
			</LinearGradient>
			<AuthTabBar activeTab="login" onTabChange={handleTabChange} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	gradientContainer: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	contentWrapper: {
		flex: 1,
		alignItems: 'center',
	},
	logoSection: {
		alignItems: 'center',
		width: '100%',
		marginTop: Platform.OS === 'web' ? 40 : 0,
	},
	mainContent: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
		marginTop: 4,
	},
});
