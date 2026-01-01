import { DefaultLayout, TwoButtons } from '@/src/features/layout/ui';
import { SignupSteps, useSignupProgress } from '@/src/features/signup/hooks';
import useUniversityDetails from '@/src/features/signup/hooks/use-university-details';
import AcademicInfoSelector from '@/src/features/signup/ui/university-details/academic-info-selector';
import DepartmentSearch from '@/src/features/signup/ui/university-details/department-search';
import { withSignupValidation } from '@/src/features/signup/ui/withSignupValidation';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { Text } from '@/src/shared/ui/text';
import Loading from '@features/loading';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
	BackHandler,
	Keyboard,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';

function UniversityDetailsPage() {
	const { onBackPress, onNext, signupLoading, nextable } = useUniversityDetails();
	const router = useRouter();
	const { t } = useTranslation();
	const { updateShowHeader } = useSignupProgress();
	const hasTrackedView = useRef(false);

	useEffect(() => {
		if (!hasTrackedView.current) {
			mixpanelAdapter.track('Signup_Details_View', {
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
			hasTrackedView.current = true;
		}
		updateShowHeader(true);
	}, [updateShowHeader]);

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', () =>
			onBackPress(() => {
				router.navigate('/auth/signup/university');
			}),
		);

		return () => subscription.remove();
	}, []);

	const handleBackPress = () => {
		onBackPress(() => {
			router.navigate('/auth/signup/university');
		});
	};

	const handleNext = () => {
		onNext(() => {
			router.push('/auth/signup/instagram');
		});
	};

	if (signupLoading) {
		return <Loading.Page title={t('apps.auth.sign_up.university_detail.next_button_wait')} />;
	}

	const handleGoToStart = () => {
		router.replace('/auth/login');
	};

	return (
		<DefaultLayout>
			<ScrollView
				nestedScrollEnabled={true}
				keyboardShouldPersistTaps="always"
				keyboardDismissMode="none"
				contentContainerStyle={styles.scrollContent}
			>
				<Pressable
					onPress={() => {
						if (Platform.OS !== 'web') {
							Keyboard.dismiss();
						}
					}}
				>
					<View style={styles.imageWrapper}>
						<Image source={require('@assets/images/details.png')} style={styles.headerImage} />
					</View>

					<View style={[styles.contentWrapper, styles.departmentSection]}>
						<View style={styles.titleWrapper}>
							<Text size="lg" weight="semibold" textColor="purple" style={styles.title}>
								{t('apps.auth.sign_up.university_detail.title_department')}
							</Text>
							<Text size="sm" weight="normal" textColor="muted" style={styles.subtitle}>
								{t('apps.auth.sign_up.university_detail.subtitle_department')}
							</Text>
						</View>
						<DepartmentSearch />
					</View>

					<View style={[styles.contentWrapper, styles.academicSection]}>
						<View style={styles.titleWrapper}>
							<Text size="lg" weight="semibold" textColor="purple" style={styles.title}>
								{t('apps.auth.sign_up.university_detail.title_academic')}
							</Text>
							<Text size="sm" weight="normal" textColor="muted" style={styles.subtitle}>
								{t('apps.auth.sign_up.university_detail.subtitle_academic')}
							</Text>
						</View>
						<AcademicInfoSelector />
					</View>
				</Pressable>
			</ScrollView>
			<View style={styles.bottomContainer}>
				<TwoButtons
					disabledNext={!nextable}
					onClickNext={handleNext}
					onClickPrevious={handleGoToStart}
					content={{ prev: t('apps.auth.sign_up.university_detail.go_to_start') }}
				/>
			</View>
		</DefaultLayout>
	);
}

export default withSignupValidation(UniversityDetailsPage, SignupSteps.UNIVERSITY_DETAIL);

const styles = StyleSheet.create({
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingBottom: 140,
	},
	imageWrapper: {
		paddingHorizontal: 5,
	},
	headerImage: {
		width: 81,
		height: 81,
		marginBottom: 16,
	},
	titleWrapper: {
		gap: 4,
	},
	title: {
		lineHeight: 22,
	},
	subtitle: {
		lineHeight: 20,
	},
	contentWrapper: {
		gap: 15,
		marginTop: 34,
		paddingHorizontal: 10,
	},
	departmentSection: {
		zIndex: 10,
	},
	academicSection: {
		marginTop: 40,
		paddingBottom: 214,
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		paddingTop: 16,
		paddingHorizontal: 0,
		backgroundColor: 'transparent',
	},
});
