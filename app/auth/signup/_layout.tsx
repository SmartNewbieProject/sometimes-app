import { DefaultLayout } from '@/src/features/layout/ui';
import { useWindowWidth } from '@/src/features/signup/hooks';
import colors from '@/src/shared/constants/colors';
import { OverlayProvider } from '@/src/shared/hooks/use-overlay';
import { useSignupSession } from '@/src/shared/hooks/use-signup-session';
import Loading from '@features/loading';
import Signup from '@features/signup';
import { PalePurpleGradient } from '@shared/ui/gradient';
import { ProgressBar } from '@shared/ui/progress-bar';
import { Stack, usePathname } from 'expo-router';
import * as React from 'react';
import { Suspense } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const { useSignupProgress, SignupSteps } = Signup;

export default function SignupLayout() {
	const { progress, updateStep, step, showHeader } = useSignupProgress();
	const { startSignupSession, recordMilestone } = useSignupSession();

	const { t } = useTranslation();
	const pathname = usePathname();
	const renderProgress =
		pathname !== '/auth/signup/done' && pathname !== '/auth/signup/university-cluster';
	const width = useWindowWidth();
	const progressWidth = width > 480 ? 448 : width - 32;
	const insets = useSafeAreaInsets();
	const titleMap = {
		[SignupSteps.UNIVERSITY]: t('apps.auth.sign_up.select_university'),
		[SignupSteps.UNIVERSITY_DETAIL]: t('apps.auth.sign_up.select_university_detail'),
		[SignupSteps.PROFILE_IMAGE]: t('apps.auth.sign_up.Profile_image'),
		[SignupSteps.INVITE_CODE]: t('apps.auth.sign_up.invite_code.title'),
	};

	const getTitle = () => {
		if (pathname === '/auth/signup/jp-profile') {
			return t('features.jp-auth.profile.title');
		}
		if (pathname === '/auth/signup/apple-info') {
			return t('apps.auth.login.apple_login_title');
		}
		return titleMap[step];
	};
	const title = getTitle();

	// 회원가입 세션 시작 및 마일스톤 추적
	React.useEffect(() => {
		// 첫 화면에서 세션 시작
		if (step === SignupSteps.UNIVERSITY) {
			startSignupSession();
			recordMilestone('signup_started', {
				entry_point: 'university_selection',
			});
		}
	}, [step, startSignupSession, recordMilestone]);

	return (
		<DefaultLayout style={styles.layout}>
			<OverlayProvider>
				<PalePurpleGradient />
				{renderProgress && showHeader && (
					<>
						<View
							style={[styles.titleContainer, { paddingTop: insets.top + 10, paddingBottom: 10 }]}
						>
							<Text style={styles.title}>{title}</Text>
						</View>

						<View style={styles.progressBarContainer}>
							<ProgressBar progress={progress} width={progressWidth} />
						</View>
					</>
				)}
				<Suspense fallback={<Loading.Page />}>
					<Stack
						screenOptions={{
							headerShown: false,
							contentStyle: {
								backgroundColor: 'transparent',
							},
							animation: 'slide_from_right',
						}}
					>
						<Stack.Screen
							name="apple-info"
							options={{
								headerShown: false,
								gestureEnabled: false,
							}}
						/>
						<Stack.Screen
							name="jp-profile"
							options={{
								headerShown: false,
								gestureEnabled: false,
							}}
						/>
						<Stack.Screen
							name="university"
							options={{
								headerShown: false,
								gestureEnabled: false,
							}}
						/>
						<Stack.Screen name="university-cluster" options={{ headerShown: false }} />
						<Stack.Screen name="university-details" options={{ headerShown: false }} />
						<Stack.Screen name="profile-image" options={{ headerShown: false }} />
						<Stack.Screen name="done" options={{ headerShown: false }} />
					</Stack>
				</Suspense>
			</OverlayProvider>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	layout: {
		position: 'relative',
	},
	titleContainer: {
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		color: colors.black,
		fontFamily: 'Pretendard-Bold',
		lineHeight: 22,
		fontSize: 20,
	},
	progressBarContainer: {
		paddingBottom: 30,
		alignItems: 'center',
		backgroundColor: colors.surface.background,
	},
});
