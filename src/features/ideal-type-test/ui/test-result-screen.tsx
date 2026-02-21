import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { getResultMascotImage } from '@/src/features/ideal-type-test/get-result-mascot-image';
import { useTestAnalytics } from '@/src/features/ideal-type-test/hooks/use-test-analytics';
import { useTestProgress } from '@/src/features/ideal-type-test/hooks/use-test-progress';
import { useStats } from '@/src/features/ideal-type-test/queries';
import type { ResultTypeId } from '@/src/features/ideal-type-test/types';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const resultPresetImage = require('@assets/images/ideal-type-test/result-preset.png');

const SCREEN_WIDTH = Math.min(Dimensions.get('window').width, 430);

export interface TestResultScreenProps {
	source: 'auth' | 'moment';
	ctaText: string;
	onCtaPress: () => void;
	showShareButton?: boolean;
	showDismissButton?: boolean;
	onDismiss?: () => void;
	onSharePress?: () => void;
	onRedirectToStart: () => void;
	children?: React.ReactNode;
}

export function TestResultScreen({
	source,
	ctaText,
	onCtaPress,
	showShareButton = false,
	showDismissButton = true,
	onDismiss,
	onSharePress,
	onRedirectToStart,
	children,
}: TestResultScreenProps) {
	const { t, i18n } = useTranslation();
	const insets = useSafeAreaInsets();
	const { isAuthorized } = useAuth();
	const { trackSignupClicked } = useTestAnalytics();
	const { result, sessionId } = useTestProgress();
	const hasTrackedResult = useRef(false);

	const currentLang = i18n.language?.startsWith('ja') ? 'ja' : 'ko';
	const userType = isAuthorized ? 'logged_in' : 'guest';

	const { data: stats } = useStats({
		resultTypeId: (result?.id || '') as ResultTypeId,
		enabled: !!result?.id,
	});

	useEffect(() => {
		if (!result) {
			onRedirectToStart();
		}
	}, [result, onRedirectToStart]);

	useEffect(() => {
		if (result && sessionId && !hasTrackedResult.current) {
			hasTrackedResult.current = true;
		}
	}, [result, sessionId]);

	const matchCount = stats?.count || 23;

	const handleCta = () => {
		if (!result) return;

		trackSignupClicked({
			source: 'mobile',
			session_id: sessionId || '',
			result_type_id: result.id,
			total_questions: 5,
			completion_time_seconds: 0,
			user_type: userType,
		});

		onCtaPress();
	};

	if (!result) {
		return null;
	}

	return (
		<>
			{/* Decorative purple blobs */}
			<View style={styles.blobTopLeft}>
				<LinearGradient
					colors={['rgba(122,74,226,0.3)', 'rgba(122,74,226,0.08)', 'transparent']}
					style={StyleSheet.absoluteFill}
					start={{ x: 0.3, y: 0.3 }}
					end={{ x: 1, y: 1 }}
				/>
			</View>
			<View style={styles.blobBottomRight}>
				<LinearGradient
					colors={['rgba(122,74,226,0.2)', 'rgba(122,74,226,0.05)', 'transparent']}
					style={StyleSheet.absoluteFill}
					start={{ x: 0.6, y: 0.4 }}
					end={{ x: 0, y: 0 }}
				/>
			</View>

			{/* Content */}
			<View style={[styles.content, { paddingTop: insets.top }]}>
				{/* Hero result */}
				<Animated.View entering={FadeInDown.duration(500)} style={styles.heroSection}>
					<Text style={styles.heroLabel}>{t('features.ideal-type-test.result.your_type')}</Text>
					<Text style={styles.heroName}>{result.name}</Text>
					<Text style={styles.heroDescription}>{result.description}</Text>
					{result.tags.length > 0 && (
						<View style={styles.heroTags}>
							{result.tags.map((tag) => (
								<View key={tag} style={styles.heroTagChip}>
									<Text style={styles.heroTagText}>{tag}</Text>
								</View>
							))}
						</View>
					)}
				</Animated.View>

				{/* Cards visualization area */}
				<Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.cardsArea}>
					<Image source={resultPresetImage} style={styles.presetImage} resizeMode="contain" />
					<Image
						source={getResultMascotImage(result.id)}
						style={styles.mascot}
						resizeMode="contain"
					/>
				</Animated.View>

				{/* Match count text */}
				<Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.matchCountWrap}>
					{currentLang === 'ja' ? (
						<Text style={styles.matchCountText}>
							<Text style={styles.matchCountHighlight}>理想のタイプ</Text>
							に合う大学生 <Text style={styles.matchCountHighlight}>{matchCount}人</Text>
							が活動中です!
						</Text>
					) : (
						<Text style={styles.matchCountText}>
							<Text style={styles.matchCountHighlight}>내 이상형</Text>에 부합하는 대학생{' '}
							<Text style={styles.matchCountHighlight}>{matchCount}명</Text>이 활동중이에요!
						</Text>
					)}
				</Animated.View>
			</View>

			{/* CTA area */}
			<Animated.View
				entering={SlideInDown.delay(700).duration(400)}
				style={[styles.ctaContainer, { paddingBottom: insets.bottom + 24 }]}
			>
				{showShareButton && onSharePress && (
					<Pressable style={styles.shareButton} onPress={onSharePress}>
						<Text style={styles.shareButtonText}>
							{t('features.ideal-type-test.result.share_button')}
						</Text>
					</Pressable>
				)}

				<Pressable style={styles.ctaButton} onPress={handleCta}>
					<Text style={styles.ctaButtonText}>{ctaText}</Text>
				</Pressable>

				{showDismissButton && onDismiss && (
					<Pressable onPress={onDismiss} style={styles.dismissLink}>
						<Text style={styles.dismissText}>
							{t('features.ideal-type-test.result.dismiss_button')}
						</Text>
					</Pressable>
				)}
			</Animated.View>

			{/* Children (e.g. AuthBottomSheet overlay) */}
			{children}
		</>
	);
}

const styles = StyleSheet.create({
	// Decorative blobs
	blobTopLeft: {
		position: 'absolute',
		top: 100,
		left: -40,
		width: 180,
		height: 180,
		borderRadius: 90,
		overflow: 'hidden',
	},
	blobBottomRight: {
		position: 'absolute',
		bottom: 20,
		right: -100,
		width: 380,
		height: 380,
		borderRadius: 190,
		overflow: 'hidden',
	},

	// Content
	content: {
		flex: 1,
	},

	// Hero section
	heroSection: {
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 8,
		alignItems: 'center',
	},
	heroLabel: {
		fontSize: 12,
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.secondary,
		marginTop: 8,
	},
	heroName: {
		fontSize: 22,
		fontFamily: 'Pretendard-SemiBold',
		color: semanticColors.brand.primary,
		marginTop: 4,
	},
	heroDescription: {
		fontSize: 14,
		fontFamily: 'Pretendard-Regular',
		color: semanticColors.text.secondary,
		textAlign: 'center',
		marginTop: 8,
		lineHeight: 20,
	},
	heroTags: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 12,
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	heroTagChip: {
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 4,
	},
	heroTagText: {
		fontSize: 12,
		fontFamily: 'Pretendard-Medium',
		color: colors.white,
	},

	// Cards area
	cardsArea: {
		flex: 1,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
	},
	presetImage: {
		width: SCREEN_WIDTH * 1.35,
		height: SCREEN_WIDTH * 0.76,
	},

	// Mascot
	mascot: {
		position: 'absolute',
		bottom: -8,
		right: SCREEN_WIDTH * 0.02,
		width: SCREEN_WIDTH * 0.38,
		height: SCREEN_WIDTH * 0.38,
		zIndex: 6,
	},

	// Match count
	matchCountWrap: {
		paddingHorizontal: 24,
		paddingBottom: 8,
		alignItems: 'center',
	},
	matchCountText: {
		fontSize: 13,
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.primary,
		textAlign: 'center',
		lineHeight: 20,
	},
	matchCountHighlight: {
		color: semanticColors.brand.primary,
		fontFamily: 'Pretendard-SemiBold',
	},

	// CTA
	ctaContainer: {
		paddingHorizontal: 24,
		gap: 16,
		alignItems: 'center',
	},
	ctaButton: {
		width: SCREEN_WIDTH * 0.75,
		height: 66,
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 6,
	},
	ctaButtonText: {
		fontSize: 18,
		fontFamily: 'Pretendard-SemiBold',
		color: colors.white,
	},
	shareButton: {
		width: SCREEN_WIDTH * 0.75,
		height: 48,
		backgroundColor: 'transparent',
		borderRadius: 20,
		borderWidth: 2,
		borderColor: semanticColors.brand.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	shareButtonText: {
		fontSize: 16,
		fontFamily: 'Pretendard-SemiBold',
		color: semanticColors.brand.primary,
	},
	dismissLink: {
		paddingVertical: 4,
	},
	dismissText: {
		fontSize: 16,
		fontFamily: 'Pretendard-Medium',
		color: '#939598',
		textDecorationLine: 'underline',
	},
});
