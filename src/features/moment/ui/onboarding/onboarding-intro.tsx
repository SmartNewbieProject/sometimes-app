import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { DimensionValue, ImageSourcePropType } from 'react-native';
import {
	AccessibilityInfo,
	Dimensions,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfileDetailsQuery } from '@/src/features/auth/queries';
import colors from '@/src/shared/constants/colors';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { Text } from '@/src/shared/ui';
import { useSkipOnboardingMutation } from '../../queries/onboarding';
import { MOMENT_ONBOARDING_KEYS } from './keys';

const { width } = Dimensions.get('window');

// ============================================
// Floating Particle
// ============================================
interface ParticleProps {
	emoji: string;
	size: number;
	color: string;
	top: DimensionValue;
	left: DimensionValue;
	delay: number;
	duration: number;
}

const FloatingParticle = ({ emoji, size, color, top, left, delay, duration }: ParticleProps) => {
	const translateY = useSharedValue(0);
	const opacity = useSharedValue(0);

	useEffect(() => {
		AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
			opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
			if (!reduceMotion) {
				translateY.value = withDelay(
					delay,
					withRepeat(
						withSequence(
							withTiming(-12, { duration, easing: Easing.inOut(Easing.ease) }),
							withTiming(12, { duration, easing: Easing.inOut(Easing.ease) }),
						),
						-1,
						true,
					),
				);
			}
		});
	}, [delay, duration, translateY, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	return (
		<Animated.Text style={[styles.particle, { top, left, fontSize: size, color }, animatedStyle]}>
			{emoji}
		</Animated.Text>
	);
};

const PARTICLES: ParticleProps[] = [
	{
		emoji: '\u2665',
		size: 18,
		color: '#FF6B9D',
		top: '15%',
		left: '10%',
		delay: 0,
		duration: 3000,
	},
	{
		emoji: '\u2726',
		size: 14,
		color: '#FFD700',
		top: '12%',
		left: '80%',
		delay: 400,
		duration: 3500,
	},
	{
		emoji: '\u2665',
		size: 12,
		color: '#E2D5FF',
		top: '28%',
		left: '85%',
		delay: 800,
		duration: 4000,
	},
	{
		emoji: '\u2726',
		size: 16,
		color: '#FF6B9D',
		top: '22%',
		left: '5%',
		delay: 1200,
		duration: 3200,
	},
	{
		emoji: '\u2665',
		size: 10,
		color: '#FFD700',
		top: '35%',
		left: '75%',
		delay: 600,
		duration: 3800,
	},
	{
		emoji: '\u2726',
		size: 13,
		color: '#E2D5FF',
		top: '8%',
		left: '45%',
		delay: 1000,
		duration: 4200,
	},
];

// ============================================
// Stagger Fade-in
// ============================================
const StaggerFadeIn = ({
	children,
	delay,
	style,
}: { children: React.ReactNode; delay: number; style?: object }) => {
	const opacity = useSharedValue(0);
	const translateY = useSharedValue(20);

	useEffect(() => {
		opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
		translateY.value = withDelay(
			delay,
			withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }),
		);
	}, [delay, opacity, translateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }],
	}));

	return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};

// ============================================
// Shimmer Button
// ============================================
const ShimmerButton = ({
	onPress,
	children,
}: { onPress: () => void; children: React.ReactNode }) => {
	const shimmerX = useSharedValue(-width);

	useEffect(() => {
		shimmerX.value = withRepeat(
			withSequence(
				withTiming(width, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
				withDelay(1500, withTiming(-width, { duration: 0 })),
			),
			-1,
		);
	}, [shimmerX]);

	const shimmerStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shimmerX.value }],
	}));

	return (
		<Pressable onPress={onPress} style={styles.startButton}>
			{children}
			<Animated.View style={[styles.shimmerOverlay, shimmerStyle]} pointerEvents="none">
				<LinearGradient
					colors={['transparent', 'rgba(212, 187, 255, 0.4)', 'transparent']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
		</Pressable>
	);
};

// ============================================
// Gender Fallback Images
// ============================================
const GENDER_FALLBACK_IMAGES: Record<string, ImageSourcePropType> = {
	MALE: require('@/assets/images/samples/man/man_0.webp'),
	FEMALE: require('@/assets/images/samples/girl/girl_0.webp'),
};

// ============================================
// Onboarding Icon Assets
// ============================================
const ONBOARDING_ICONS = {
	traitExplorer: require('@/assets/images/heart-balloon.png'),
	traitPersonality: require('@/assets/images/gem-icon.webp'),
	traitMatching: require('@/assets/images/heart-arrow.png'),
	benefitMatching: require('@/assets/images/chart-arrow.png'),
	benefitChat: require('@/assets/images/matching-guide-hearts.webp'),
	benefitInsight: require('@/assets/images/love-letter.webp'),
} as const;

// ============================================
// Before Card
// ============================================
const ProfileCircle = ({
	imageSource,
	style: circleStyle,
}: { imageSource: ImageSourcePropType; style: object }) => (
	<View style={circleStyle}>
		<Image source={imageSource} style={styles.profileImage} resizeMode="cover" />
	</View>
);

const BeforeCard = ({ profileImageSource }: { profileImageSource: ImageSourcePropType }) => {
	const { t } = useTranslation();

	return (
		<View style={styles.compareCard}>
			<View style={styles.beforeCardInner}>
				<View style={styles.beforeTag}>
					<Text size="12" weight="semibold" style={styles.beforeTagText}>
						{t(MOMENT_ONBOARDING_KEYS.intro.beforeTag)}
					</Text>
				</View>
				<ProfileCircle imageSource={profileImageSource} style={styles.profileCircleBefore} />
				<Text size="14" weight="bold" style={styles.beforeName}>
					{t(MOMENT_ONBOARDING_KEYS.intro.beforeName)}
				</Text>
				<View style={styles.traitList}>
					<View style={styles.beforeTraitChip}>
						<Text size="12" weight="medium" style={styles.beforeTraitText}>
							{t(MOMENT_ONBOARDING_KEYS.intro.beforeTrait1)}
						</Text>
					</View>
					<View style={styles.beforeTraitChip}>
						<Text size="12" weight="medium" style={styles.beforeTraitText}>
							{t(MOMENT_ONBOARDING_KEYS.intro.beforeTrait3)}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

// ============================================
// After Card
// ============================================
const AfterCard = ({ profileImageSource }: { profileImageSource: ImageSourcePropType }) => {
	const { t } = useTranslation();

	return (
		<View style={styles.compareCard}>
			<View style={styles.afterCardInner}>
				<View style={styles.sparkleBadge}>
					<Sparkles size={14} color="#FFFFFF" />
				</View>
				<View style={styles.afterTag}>
					<Text size="12" weight="semibold" style={styles.afterTagText}>
						{t(MOMENT_ONBOARDING_KEYS.intro.afterTag)}
					</Text>
				</View>
				<ProfileCircle imageSource={profileImageSource} style={styles.profileCircleAfter} />
				<Text size="14" weight="bold" style={styles.afterName}>
					{t(MOMENT_ONBOARDING_KEYS.intro.afterName)}
				</Text>
				<View style={styles.traitList}>
					<View style={styles.afterTraitChip}>
						<Image source={ONBOARDING_ICONS.traitExplorer} style={styles.traitIcon} />
						<Text size="12" weight="medium" style={styles.afterTraitText}>
							{t(MOMENT_ONBOARDING_KEYS.intro.afterTrait1)}
						</Text>
					</View>
					<View style={styles.afterTraitChip}>
						<Image source={ONBOARDING_ICONS.traitPersonality} style={styles.traitIcon} />
						<Text size="12" weight="medium" style={styles.afterTraitText}>
							{t(MOMENT_ONBOARDING_KEYS.intro.afterTrait2)}
						</Text>
					</View>
					<View style={styles.afterTraitChip}>
						<Image source={ONBOARDING_ICONS.traitMatching} style={styles.traitIcon} />
						<Text size="12" weight="medium" style={styles.afterTraitText}>
							{t(MOMENT_ONBOARDING_KEYS.intro.afterTrait3)}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

// ============================================
// Benefit Pills
// ============================================
const BenefitPills = () => {
	const { t } = useTranslation();

	const benefits = [
		{
			icon: ONBOARDING_ICONS.benefitMatching,
			text: t(MOMENT_ONBOARDING_KEYS.intro.benefitMatching),
		},
		{
			icon: ONBOARDING_ICONS.benefitChat,
			text: t(MOMENT_ONBOARDING_KEYS.intro.benefitConversation),
		},
		{ icon: ONBOARDING_ICONS.benefitInsight, text: t(MOMENT_ONBOARDING_KEYS.intro.benefitInsight) },
	];

	return (
		<View style={styles.benefitPillsContainer}>
			{benefits.map((b) => (
				<View key={b.text} style={styles.benefitPill}>
					<Image source={b.icon} style={styles.benefitIcon} />
					<Text size="13" weight="medium" style={styles.benefitPillText}>
						{b.text}
					</Text>
				</View>
			))}
		</View>
	);
};

// ============================================
// Main Component
// ============================================
export const OnboardingIntro = () => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const skipMutation = useSkipOnboardingMutation();
	const { value: accessToken } = useStorage<string | null>({
		key: 'access-token',
		initialValue: null,
	});
	const { data: profileDetails } = useProfileDetailsQuery(accessToken ?? null);

	const profileImageSource: ImageSourcePropType = useMemo(() => {
		if (profileDetails?.profileImages?.length) {
			const mainImage = profileDetails.profileImages.find((img) => img.isMain);
			const url = mainImage?.url ?? profileDetails.profileImages[0]?.url;
			if (url) return { uri: url };
		}
		const gender = profileDetails?.gender ?? 'MALE';
		return GENDER_FALLBACK_IMAGES[gender];
	}, [profileDetails]);

	const handleStart = () => {
		router.push('/moment/onboarding/questions');
	};

	const handleSkip = async () => {
		try {
			await skipMutation.mutateAsync();
		} catch {}
		router.replace('/moment');
	};

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FFFFFF', '#F8F5FF', '#F8F5FF']}
				locations={[0, 0.5, 1]}
				style={styles.gradient}
			/>

			{/* Floating Particles */}
			{PARTICLES.map((p) => (
				<FloatingParticle key={`${p.emoji}-${p.delay}`} {...p} />
			))}

			{/* Skip Button */}
			<View style={[styles.skipContainer, { top: insets.top + 12 }]}>
				<Pressable
					onPress={handleSkip}
					hitSlop={12}
					accessible={true}
					accessibilityRole="button"
					accessibilityLabel={t(MOMENT_ONBOARDING_KEYS.intro.skipButton)}
				>
					<Text size="14" weight="medium" style={{ color: '#767676' }}>
						{t(MOMENT_ONBOARDING_KEYS.intro.skipButton)}
					</Text>
				</Pressable>
			</View>

			<ScrollView
				style={[styles.scrollView, { paddingTop: insets.top + 40 }]}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Title Section */}
				<StaggerFadeIn delay={0} style={styles.titleSection}>
						<Text size="24" weight="bold" textColor="black" style={styles.title}>
							{t(MOMENT_ONBOARDING_KEYS.intro.title)}
						</Text>
					<Text size="14" weight="normal" textColor="gray" style={styles.subtitle}>
						{t(MOMENT_ONBOARDING_KEYS.intro.subtitle)}
					</Text>
				</StaggerFadeIn>

				{/* Before / After Comparison */}
				<StaggerFadeIn delay={200} style={styles.comparisonRow}>
					<BeforeCard profileImageSource={profileImageSource} />
					<AfterCard profileImageSource={profileImageSource} />
				</StaggerFadeIn>

				{/* Benefit Pills */}
				<StaggerFadeIn delay={400} style={styles.benefitSection}>
					<BenefitPills />
				</StaggerFadeIn>
			</ScrollView>

			{/* Bottom CTA */}
			<StaggerFadeIn
				delay={600}
				style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}
			>
				<ShimmerButton onPress={handleStart}>
					<View style={styles.buttonContent}>
						<Sparkles size={18} color="#FFFFFF" />
						<Text size="16" weight="semibold" textColor="white">
							{t(MOMENT_ONBOARDING_KEYS.intro.startButton)}
						</Text>
					</View>
				</ShimmerButton>
				<Text size="13" weight="normal" style={styles.ctaSubtext}>
					{t(MOMENT_ONBOARDING_KEYS.intro.ctaSubtext)}
				</Text>
			</StaggerFadeIn>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	gradient: {
		...StyleSheet.absoluteFillObject,
	},
	particle: {
		position: 'absolute',
		zIndex: 1,
	},
	skipContainer: {
		position: 'absolute',
		right: 20,
		zIndex: 10,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	titleSection: {
		alignItems: 'center',
		marginBottom: 24,
		paddingHorizontal: 8,
	},
	title: {
		textAlign: 'center',
		marginBottom: 6,
	},
	subtitle: {
		textAlign: 'center',
	},
	comparisonRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 20,
	},
	compareCard: {
		flex: 1,
	},
	// Before Card
	beforeCardInner: {
		flex: 1,
		borderRadius: 20,
		paddingVertical: 24,
		paddingHorizontal: 16,
		alignItems: 'center',
		backgroundColor: '#F5F5F5',
		borderWidth: 1.5,
		borderStyle: 'dashed',
		borderColor: '#D0D0D0',
	},
	beforeTag: {
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: '#E8E8E8',
		marginBottom: 16,
	},
	beforeTagText: {
		color: '#999999',
	},
	profileCircleBefore: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#E0E0E0',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 14,
		overflow: 'hidden',
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	beforeName: {
		color: '#999999',
		marginBottom: 12,
	},
	traitList: {
		gap: 8,
		alignSelf: 'stretch',
	},
	beforeTraitChip: {
		paddingVertical: 7,
		paddingHorizontal: 12,
		borderRadius: 10,
		backgroundColor: '#E8E8E8',
		alignItems: 'center',
	},
	beforeTraitText: {
		color: '#BBBBBB',
	},
	// After Card
	afterCardInner: {
		flex: 1,
		borderRadius: 20,
		paddingVertical: 24,
		paddingHorizontal: 16,
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: '#D4BBFF',
		backgroundColor: '#FDFBFF',
		shadowColor: '#7A4AE2',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 16,
		elevation: 4,
	},
	afterTag: {
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: '#7A4AE2',
		marginBottom: 16,
	},
	afterTagText: {
		color: '#FFFFFF',
	},
	sparkleBadge: {
		position: 'absolute',
		top: 8,
		right: 8,
		backgroundColor: '#FFD700',
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#FFD700',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.4,
		shadowRadius: 8,
		elevation: 4,
		zIndex: 2,
	},
	profileCircleAfter: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#E8DEFF',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 14,
		overflow: 'hidden',
		shadowColor: '#7A4AE2',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 4,
	},
	afterName: {
		color: '#2D1B69',
		marginBottom: 12,
	},
	afterTraitChip: {
		flexDirection: 'row',
		gap: 6,
		paddingVertical: 7,
		paddingHorizontal: 12,
		borderRadius: 10,
		backgroundColor: 'rgba(122, 74, 226, 0.1)',
		alignItems: 'center',
		alignSelf: 'stretch',
	},
	afterTraitText: {
		color: '#7A4AE2',
	},
	traitIcon: {
		width: 18,
		height: 18,
	},
	// Benefit Pills
	benefitSection: {
		marginBottom: 8,
	},
	benefitPillsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 8,
	},
	benefitPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingVertical: 10,
		paddingHorizontal: 16,
		backgroundColor: '#FFFFFF',
		borderRadius: 24,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
	},
	benefitPillText: {
		color: '#444444',
	},
	benefitIcon: {
		width: 22,
		height: 22,
	},
	// CTA
	buttonContainer: {
		paddingHorizontal: 24,
		paddingTop: 16,
		alignItems: 'center',
	},
	startButton: {
		width: '100%',
		height: 60,
		backgroundColor: colors.brand.primary,
		borderRadius: 9999,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	ctaSubtext: {
		color: '#999999',
		marginTop: 8,
	},
	shimmerOverlay: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: 80,
	},
});
