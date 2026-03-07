import { DefaultLayout, TwoButtons } from '@/src/features/layout/ui';
import { useSignupProgress } from '@/src/features/signup/hooks';
import { useClusterQuery } from '@/src/features/signup/queries';
import type { UniversityCard as UniversityCardType } from '@/src/features/signup/queries/use-universities';
import UniversityCard from '@/src/features/signup/ui/university/university-card';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import PinIcon from '@assets/icons/pin.svg';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function UniversityCluster() {
	const { t } = useTranslation();
	const {
		form: { universityId },
		univTitle,
		regions,
	} = useSignupProgress();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const regionCode = regions.length > 0 ? regions[0] : '';
	const { cluster, universities, isLoading } = useClusterQuery(regionCode);

	const clusterName = cluster?.name ?? '';
	const sortedData = useMemo(
		() => [...universities].sort((a, b) => a.name.localeCompare(b.name, 'ko')),
		[universities],
	);

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

			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color={semanticColors.brand.primary} />
				</View>
			) : cluster ? (
				<>
					<View style={styles.clusterContainer}>
						<PinIcon />
						<View style={{ gap: 6 }}>
							<Text style={styles.clusterLabel}>
								{t('apps.auth.sign_up.university_cluster.cluster_label')}
							</Text>
							<Text style={styles.clusterText}>
								{clusterName}
								{t('apps.auth.sign_up.university_cluster.cluster_suffix')}
							</Text>
							<Text style={styles.clusterDesc}>
								{t('apps.auth.sign_up.university_cluster.cluster_desc')}
							</Text>
						</View>
					</View>
						<FlashList
							data={sortedData}
							estimatedItemSize={56}
							renderItem={({ item }) => (
								<UniversityCard
									onClick={() => {}}
									isSelected={false}
									item={{
										...item,
										area: item.region,
										foundation: item.foundation as UniversityCardType['foundation'],
										en: null,
										universityType: item.foundation as UniversityCardType['universityType'],
									} as UniversityCardType}
								/>
							)}
							contentContainerStyle={{ paddingBottom: 160 }}
							style={styles.univContainer}
						/>
				</>
			) : (
				<View style={styles.pendingContainer}>
					<View style={styles.pendingCard}>
						<PinIcon />
						<View style={{ gap: 6, flex: 1 }}>
							<Text style={styles.clusterLabel}>
								{t('apps.auth.sign_up.university_cluster.cluster_label')}
							</Text>
							<Text style={styles.pendingText}>
								{t('apps.auth.sign_up.university_cluster.pending_cluster')}
							</Text>
							<Text style={styles.pendingDesc}>
								{t('apps.auth.sign_up.university_cluster.pending_desc')}
							</Text>
						</View>
					</View>
				</View>
			)}

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
	},
	title: {
		fontSize: 32,
		alignSelf: 'center',
		fontWeight: 700,
		fontFamily: 'Pretendard-ExtraBold',
	},
	loadingContainer: {
		marginTop: 40,
		alignItems: 'center',
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
	pendingContainer: {
		marginTop: 24,
		marginHorizontal: 16,
		width: '100%',
		paddingHorizontal: 16,
	},
	pendingCard: {
		padding: 16,
		flexDirection: 'row',
		backgroundColor: semanticColors.surface.background,
		borderRadius: 12,
		gap: 12,
	},
	pendingText: {
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
		color: semanticColors.text.secondary,
	},
	pendingDesc: {
		fontSize: 12,
		fontWeight: '400',
		color: semanticColors.text.muted,
		lineHeight: 17,
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
		flex: 1,
		width: '100%',
		paddingHorizontal: 16,
		marginTop: 24,
	},
});

export default UniversityCluster;
