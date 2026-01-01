import { DefaultLayout, TwoButtons } from '@/src/features/layout/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useSignupProgress } from '@/src/features/signup/hooks';
import { getAreaByCode } from '@/src/features/signup/lib';
import useUniversitiesByArea from '@/src/features/signup/queries/use-universities-by-area';
import UniversityCard from '@/src/features/signup/ui/university/university-card';
import PinIcon from '@assets/icons/pin.svg';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function UniversityCluster() {
	const { t, i18n } = useTranslation();
	const {
		form: { universityId },
		univTitle,
		regions,
	} = useSignupProgress();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { data } = useUniversitiesByArea(regions);

	const areaList = regions.length > 0 ? getAreaByCode(regions[0]) : [];
	const sortedData = data ? [...data.sort((a, b) => a.name.localeCompare(b.name, 'ko'))] : [];
	const onBackPress = () => {
		router.navigate('/auth/signup/university');
		return true;
	};

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
		return () => subscription.remove();
	}, []);

	const handleNext = () => {
		router.push(`/auth/signup/university-details?universityId=${universityId}`);
	};
	return (
		<DefaultLayout style={styles.container}>
			<View style={[styles.lottieContainer, { paddingTop: insets.top }]}>
				<LottieView
					source={require('@assets/icons/lottie/check-icon.json')}
					loop={false}
					autoPlay
					resizeMode="contain"
					style={styles.lottie}
				/>
			</View>
			<View style={{ alignItems: 'center' }}>
				{univTitle.length > 6 ? (
					<>
						<Text style={[styles.title, { fontSize: univTitle.includes('폴리텍') ? 22 : 32 }]}>
							{univTitle}
						</Text>
						<Text style={styles.title}>
							{t('apps.auth.sign_up.university_cluster.selection_complete')}
						</Text>
					</>
				) : (
					<Text style={styles.title}>
						{univTitle} {t('apps.auth.sign_up.university_cluster.selection_complete')}
					</Text>
				)}
			</View>
			<View style={styles.clusterContainer}>
				<PinIcon />
				<View style={{ gap: 6 }}>
					<Text style={styles.clusterLabel}>
						{t('apps.auth.sign_up.university_cluster.cluster_label')}
					</Text>
					<Text style={styles.clusterText}>
						{areaList.join('/')}
						{t('apps.auth.sign_up.university_cluster.cluster_suffix')}
					</Text>
					<Text style={styles.clusterDesc}>
						{t('apps.auth.sign_up.university_cluster.cluster_desc')}
					</Text>
				</View>
			</View>
			<ScrollView style={styles.univContainer}>
				<FlashList
					data={sortedData}
					renderItem={({ item }) => (
						<UniversityCard onClick={() => {}} isSelected={false} item={item} />
					)}
					contentContainerStyle={{ paddingBottom: 160 }}
				/>
			</ScrollView>
			<View style={styles.bottomContainer}>
				<TwoButtons
					disabledNext={false}
					onClickNext={handleNext}
					onClickPrevious={() => {
						onBackPress();
					}}
				/>
			</View>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		backgroundColor: semanticColors.surface.secondary,
	},
	lottieContainer: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	lottie: {
		width: 200,
		height: 200,
		marginLeft: 45,
	},
	title: {
		fontSize: 32,
		alignSelf: 'center',
		fontWeight: 700,
		fontFamily: 'Pretendard-ExtraBold',
	},
	clusterContainer: {
		padding: 16,
		marginTop: 24,
		marginHorizontal: 16,
		flexDirection: 'row',
		backgroundColor: semanticColors.surface.background,
		borderRadius: 12,
		gap: 12,
	},
	clusterLabel: {
		fontSize: 14,
		fontWeight: 600,
		fontFamily: 'Pretendard-SemiBold',
	},
	clusterText: {
		fontSize: 18,
		fontWeight: 600,
		fontFamily: 'Pretendard-SemiBold',
	},
	clusterDesc: {
		fontSize: 12,
		fontWeight: 400,
		color: semanticColors.text.primary,
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingTop: 16,
		backgroundColor: 'transparent',
	},
	univContainer: {
		width: '100%',
		paddingHorizontal: 16,
		marginTop: 24,
	},
});

export default UniversityCluster;
