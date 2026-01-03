import { useAuth } from '@/src/features/auth';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Feedback } from '@/src/features/feedback';
import { CommunityAnnouncement, ReviewSlide, TipAnnouncement } from '@/src/features/home/ui';
import BannerSlide from '@/src/features/home/ui/banner-slide';
import LikeCollapse from '@/src/features/like/ui/like-collapse';
import HistoryCollapse from '@/src/features/matching-history/ui/history-collapse';
import { ImageResources } from '@/src/shared/libs';
import { Image } from 'expo-image';
import { Platform, Text as RNText, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BusinessInfo } from '../../../../shared/ui/business-info';
import { PalePurpleGradient } from '../../../../shared/ui/gradient';
import { Header } from '../../../../shared/ui/header';
import { ImageResource } from '../../../../shared/ui/image-resource';
import { BottomNavigation } from '../../../../shared/ui/navigation';
import { useStep } from '../../hooks/use-step';
import MockPartner from '../../mock/mock-partner';
import { likedMeMock } from '../../utils/mock-data';

function HomeGuide() {
	const { step, setStep } = useStep();
	const insets = useSafeAreaInsets();
	const { my } = useAuth();
	const { t } = useTranslation();

	const isLikeStep = step === 0 || step === 2;
	const isHistoryStep = step === 1;

	return (
		<View style={[styles.mainContainer, Platform.OS === 'web' && styles.webLayout]}>
			<PalePurpleGradient />

			{isLikeStep && (
				<View
					pointerEvents="none"
					style={[styles.highlightContainer, { top: insets.top + 166, zIndex: 300 }]}
				>
					<LikeCollapse collapse={likedMeMock(my?.gender ?? 'MALE')} type="likedMe" />
					<View style={styles.highlightBorder} />
				</View>
			)}

			{isHistoryStep && (
				<View
					pointerEvents="none"
					style={[styles.highlightContainer, { top: insets.top, marginTop: 20, zIndex: 300 }]}
				>
					<HistoryCollapse />
					<View style={styles.highlightBorder} />
				</View>
			)}

			{isLikeStep && (
				<>
					<Header
						centered
						logoSize={128}
						showBackButton={false}
						rightContent={
							<TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
								<ImageResource resource={ImageResources.GEM} width={41} height={41} />
							</TouchableOpacity>
						}
					/>

					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={[
							styles.scrollContent,
							Platform.OS === 'android' ? styles.androidPadding : styles.iosPadding,
						]}
					>
						<View style={{ paddingBottom: 4, marginTop: 2 }}>
							<BannerSlide />
						</View>

						<View style={{ marginTop: 20 }}>
							<LikeCollapse collapse={likedMeMock(my?.gender ?? 'MALE')} type="likedMe" />
						</View>

						<View style={styles.feedbackContainer}>
							<Feedback.WallaFeedbackBanner />
						</View>

						<View style={styles.mockPartnerContainer}>
							<MockPartner />
						</View>
						<View style={{ marginTop: 20 }}>
							<HistoryCollapse />
						</View>
						<View>
							<CommunityAnnouncement />
							<ReviewSlide />
						</View>

						<View style={styles.tipContainer}>
							<TipAnnouncement />
						</View>

						<BusinessInfo />
					</ScrollView>
					<BottomNavigation />
				</>
			)}

			{isHistoryStep && (
				<>
					<View
						style={[
							styles.historyContainer,
							Platform.OS === 'android' ? styles.androidPadding : styles.iosPadding,
							{ paddingTop: insets.top },
						]}
					>
						<View style={{ marginTop: 20 }}>
							<HistoryCollapse />
						</View>

						<View>
							<CommunityAnnouncement />
							<ReviewSlide />
						</View>

						<View style={styles.tipContainer}>
							<TipAnnouncement />
						</View>

						<BusinessInfo />
					</View>

					<BottomNavigation />
				</>
			)}

			{/* 안내 텍스트 */}
			<View style={styles.infoWrapper}>
				{step === 0 && (
					<>
						<RNText style={styles.infoTitle}>{t('features.guide.ui.home.info_title_1')}</RNText>
						<RNText style={styles.infoDescription}>
							{t('features.guide.ui.home.info_description_1')}
						</RNText>
						<RNText style={styles.infoDescription}>
							{t('features.guide.ui.home.info_description_2')}
						</RNText>
					</>
				)}
				{step === 1 && (
					<>
						<RNText style={styles.infoTitle}>{t('features.guide.ui.home.info_title_2')}</RNText>
						<RNText style={styles.infoDescription}>
							{t('features.guide.ui.home.info_description_3')}
						</RNText>
						<RNText style={styles.infoDescription}>
							{t('features.guide.ui.home.info_description_4')}
						</RNText>
					</>
				)}
				{step === 2 && (
					<>
						<RNText style={styles.infoTitle}>{t('features.guide.ui.home.info_title_3')}</RNText>
						<RNText style={styles.infoDescription}>
							{t('features.guide.ui.home.info_description_5')}
						</RNText>
						<RNText style={styles.infoDescription}>
							{t('features.guide.ui.home.info_description_6')}
						</RNText>
					</>
				)}
				<RNText style={styles.infoNextHint}>{t('features.guide.ui.home.info_next_hint')}</RNText>

				<Image source={require('@assets/images/instagram-some.webp')} style={styles.infoSomeImg} />
				<Image source={require('@assets/images/instagram-lock.webp')} style={styles.infoLockImg} />
			</View>

			{/* 오버레이 */}
			<TouchableOpacity style={styles.overlayTouchable} onPress={() => setStep(step + 1)} />
			<View style={styles.overlay} />
		</View>
	);
}

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		position: 'relative',
	},
	webLayout: {
		maxWidth: 468,
		width: '100%',
		alignSelf: 'center',
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
		flexDirection: 'column',
		gap: 14,
	},
	androidPadding: {
		paddingBottom: 160,
	},
	iosPadding: {
		paddingBottom: 56,
	},
	feedbackContainer: {
		marginTop: 18,
		flexDirection: 'column',
		gap: 6,
	},
	mockPartnerContainer: {
		marginTop: 14,
	},
	tipContainer: {
		marginVertical: 25,
	},
	historyContainer: {
		flex: 1,
		paddingHorizontal: 20,
		flexDirection: 'column',
		gap: 14,
	},
	highlightContainer: {
		backgroundColor: semanticColors.surface.background,
		position: 'absolute',
		left: 20,
		right: 20,
		marginTop: 20,
	},
	highlightBorder: {
		position: 'absolute',
		top: -4,
		left: -4,
		right: -4,
		bottom: -4,
		borderRadius: 12,
		borderWidth: 3,
		borderColor: semanticColors.brand.accent,
		backgroundColor: 'transparent',
	},
	overlay: {
		position: 'absolute',
		zIndex: 100,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: semanticColors.surface.inverse,
	},
	overlayTouchable: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 998,
	},
	infoWrapper: {
		zIndex: 300,
		bottom: 100,
		position: 'absolute',
		alignSelf: 'center',
		right: 72,
		paddingHorizontal: 28,
		paddingVertical: 19,
		borderRadius: 20,
		backgroundColor: semanticColors.surface.background,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		shadowColor: '#F2ECFF',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 1,
		shadowRadius: 5,
		elevation: 3,
	},
	infoTitle: {
		color: semanticColors.brand.accent,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
		lineHeight: 16.8,
		fontSize: 14,
		marginBottom: 8,
	},
	infoDescription: {
		fontSize: 12,
		lineHeight: 13.4,
		color: '#7A6FA3',
	},
	infoNextHint: {
		fontSize: 11,
		lineHeight: 14,
		color: semanticColors.brand.accent,
		fontWeight: '500',
		marginTop: 10,
		textAlign: 'left',
	},
	infoSomeImg: {
		width: 116,
		height: 175,
		position: 'absolute',
		top: 20,
		right: -66,
	},
	infoLockImg: {
		width: 52,
		height: 52,
		position: 'absolute',
		top: -30,
		left: -30,
		transform: [{ rotate: '-10deg' }],
	},
});

export default HomeGuide;
