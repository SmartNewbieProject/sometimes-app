import { type AuthTab, AuthTabBar } from '@/src/features/article/ui';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { useToast } from '@/src/shared/hooks/use-toast';
import { resetAuthState } from '@/src/shared/libs/axios';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import Signup from '@features/signup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { useSignupProgress } = Signup;

export default function LoginScreen() {
	const { clear } = useSignupProgress();
	const params = useLocalSearchParams();
	const router = useRouter();
	const { emitToast } = useToast();
	const hasTrackedView = useRef(false);
	const insets = useSafeAreaInsets();

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
		const errorMessage = params.error as string;
		if (errorMessage) {
			emitToast(errorMessage, undefined, 3000);
		}
	}, [params.error]);

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
		alignItems: 'center',
		paddingBottom: 24,
	},
	logoSection: {
		alignItems: 'center',
		width: '100%',
		marginTop: Platform.OS === 'web' ? 40 : 0,
	},
	mainContent: {
		width: '100%',
		alignItems: 'center',
		marginTop: 4,
	},
});
