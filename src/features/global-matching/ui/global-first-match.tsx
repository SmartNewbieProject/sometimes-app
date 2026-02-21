import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTypingAnimation } from '../hooks/use-typing-animation';
import { useGlobalMatchingStatus } from '../queries';
import { OnboardingBottomSheet } from './onboarding-bottom-sheet';
import { OnboardingNudgeBanner } from './onboarding-nudge-banner';

const bgVideo = require('@/assets/videos/global-first-match-bg.mp4');

const AnimatedText = Animated.createAnimatedComponent(Text);

// #1 Staggered fade-in slide-up
function useSlideUp(delay: number) {
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(20)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 500,
				delay,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration: 500,
				delay,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
		]).start();
	}, [opacity, translateY, delay]);

	return { opacity, transform: [{ translateY }] };
}

// #4 Cursor blink
function useCursorBlink(isHolding: boolean) {
	const opacity = useRef(new Animated.Value(1)).current;
	const animRef = useRef<Animated.CompositeAnimation>(undefined);

	useEffect(() => {
		if (isHolding) {
			animRef.current = Animated.loop(
				Animated.sequence([
					Animated.timing(opacity, { toValue: 0, duration: 0, delay: 500, useNativeDriver: true }),
					Animated.timing(opacity, { toValue: 1, duration: 0, delay: 500, useNativeDriver: true }),
				]),
			);
			animRef.current.start();
		} else {
			animRef.current?.stop();
			opacity.setValue(1);
		}
		return () => animRef.current?.stop();
	}, [isHolding, opacity]);

	return opacity;
}

// #5 Chip bounce
function ChipWithBounce({ label, isActive }: { label: string; isActive: boolean }) {
	const scale = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		if (isActive) {
			Animated.sequence([
				Animated.timing(scale, {
					toValue: 1.08,
					duration: 150,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(scale, {
					toValue: 1,
					duration: 200,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]).start();
		} else {
			scale.setValue(1);
		}
	}, [isActive, scale]);

	return (
		<Animated.View style={[styles.chip, isActive && styles.chipActive, { transform: [{ scale }] }]}>
			<Text size="13" weight={isActive ? 'bold' : 'normal'} textColor="inverse">
				#{label}
			</Text>
		</Animated.View>
	);
}

type GlobalFirstMatchProps = {
	onPreferenceSelected?: (ids: string[]) => void;
};

export const GlobalFirstMatch = ({ onPreferenceSelected }: GlobalFirstMatchProps) => {
	const { t } = useTranslation();
	const { profileDetails } = useAuth();
	const { data: status } = useGlobalMatchingStatus();
	const [sheetVisible, setSheetVisible] = useState(false);
	const [selectedPreferenceIds, setSelectedPreferenceIds] = useState<string[] | null>(null);

	const showNudge =
		selectedPreferenceIds === null && (!status?.preferenceCount || status.preferenceCount === 0);

	const handleSheetComplete = (ids: string[]) => {
		setSheetVisible(false);
		setSelectedPreferenceIds(ids);
		onPreferenceSelected?.(ids);
	};

	const keywords = profileDetails?.keywords;
	const hasKeywords = keywords && keywords.length > 0;

	const typingWords = useMemo(() => {
		if (hasKeywords) {
			return keywords.map((kw) => `#${kw} `);
		}
		return [
			t('features.global-matching.first_match_fallback_1'),
			t('features.global-matching.first_match_fallback_2'),
			t('features.global-matching.first_match_fallback_3'),
		];
	}, [hasKeywords, keywords, t]);

	const { displayText, currentIndex, isHolding } = useTypingAnimation(typingWords);

	// #1 Staggered animations
	const flagsAnim = useSlideUp(0);
	const headlineAnim = useSlideUp(100);
	const textAnim = useSlideUp(250);
	const chipAnim = useSlideUp(400);
	const ctaAnim = useSlideUp(550);

	// #4 Cursor blink
	const cursorOpacity = useCursorBlink(isHolding);

	return (
		<View style={styles.container}>
			<Video
				source={bgVideo}
				style={styles.video}
				videoStyle={styles.videoInner}
				resizeMode={ResizeMode.COVER}
				shouldPlay
				isLooping
				isMuted
			/>

			{/* #2 Vignette: 4-directional gradient overlay */}
			<LinearGradient
				colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
				locations={[0, 0.35, 1]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={StyleSheet.absoluteFill}
			/>
			<LinearGradient
				colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
				locations={[0, 0.65, 1]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={StyleSheet.absoluteFill}
			/>
			<LinearGradient
				colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
				locations={[0, 0.3, 1]}
				style={StyleSheet.absoluteFill}
			/>
			<LinearGradient
				colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.65)']}
				locations={[0, 0.45, 1]}
				style={StyleSheet.absoluteFill}
			/>

			<View style={styles.content}>
				{/* #6 Flag badges */}
				<Animated.View style={[styles.flagRow, flagsAnim]}>
					<View style={styles.flagBadge}>
						<Text size="18">🇰🇷</Text>
					</View>
					<View style={styles.flagBadge}>
						<Text size="18">🇯🇵</Text>
					</View>
				</Animated.View>

				{/* #1 Headline with slide-up */}
				<AnimatedText textColor="inverse" weight="bold" style={[styles.headline, headlineAnim]}>
					{t('features.global-matching.first_match_headline')}
				</AnimatedText>

				{/* #1 Text section with slide-up */}
				<Animated.View style={[styles.textSection, textAnim]}>
					<Text textColor="inverse" size="13" style={styles.subText}>
						{t('features.global-matching.first_match_sub_sea')}
					</Text>
					<View style={styles.typingRow}>
						<Text textColor="inverse" size="18" weight="bold">
							{t('features.global-matching.first_match_typing_prefix')}{' '}
						</Text>
						<Text style={styles.typingText} size="18" weight="bold">
							{displayText}
						</Text>
						{/* #4 Blinking cursor */}
						<Animated.View style={{ opacity: cursorOpacity }}>
							<Text style={styles.cursorText} size="18" weight="bold">
								|
							</Text>
						</Animated.View>
					</View>
					<Text textColor="inverse" size="18" weight="bold">
						{t('features.global-matching.first_match_typing_suffix')}
					</Text>
				</Animated.View>

				{/* #1+5 Chips with slide-up + bounce */}
				{hasKeywords && (
					<Animated.View style={[styles.chipSection, chipAnim]}>
						<View style={styles.chipRow}>
							{keywords.map((kw, idx) => (
								<ChipWithBounce key={kw} label={kw} isActive={idx === currentIndex} />
							))}
						</View>
						<Text textColor="inverse" size="12" style={styles.chipDesc}>
							{t('features.global-matching.first_match_chip_desc')}
						</Text>
					</Animated.View>
				)}

				{/* Nudge banner */}
				{showNudge && (
					<OnboardingNudgeBanner
						preferenceCount={status?.preferenceCount ?? 0}
						onPress={() => setSheetVisible(true)}
					/>
				)}

				{/* #9 CTA hint */}
				<Animated.View style={[styles.ctaHint, ctaAnim]}>
					<Text textColor="inverse" size="12" style={styles.ctaText}>
						{t('features.global-matching.first_match_cta_hint')} ↓
					</Text>
				</Animated.View>
			</View>

			<OnboardingBottomSheet
				visible={sheetVisible}
				onClose={() => setSheetVisible(false)}
				onComplete={handleSheetComplete}
			/>
		</View>
	);
};

// #9 Bouncing arrow
function BouncingArrow() {
	const translateY = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(translateY, {
					toValue: 4,
					duration: 600,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(translateY, {
					toValue: 0,
					duration: 600,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]),
		);
		loop.start();
		return () => loop.stop();
	}, [translateY]);

	return (
		<Animated.View style={{ transform: [{ translateY }] }}>
			<Text textColor="inverse" size="14" style={styles.ctaArrow}>
				↓
			</Text>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
		borderRadius: 20,
		overflow: 'hidden',
	},
	video: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	videoInner: {
		width: '100%',
		height: '100%',
	},
	content: {
		paddingHorizontal: 24,
		paddingBottom: 28,
		gap: 12,
	},
	// #6 Flag badges
	flagRow: {
		flexDirection: 'row',
		gap: 6,
	},
	flagBadge: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.12)',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.18)',
	},
	headline: {
		fontSize: 28,
		lineHeight: 36,
	},
	subText: {
		opacity: 0.8,
	},
	textSection: {
		gap: 2,
	},
	typingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 28,
	},
	typingText: {
		color: semanticColors.brand.primaryLight,
	},
	cursorText: {
		color: semanticColors.brand.primaryLight,
	},
	chipSection: {
		gap: 8,
	},
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.15)',
	},
	chipActive: {
		backgroundColor: semanticColors.brand.primary,
	},
	chipDesc: {
		opacity: 0.7,
	},
	// #9 CTA hint
	ctaHint: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		marginTop: 4,
	},
	ctaText: {
		opacity: 0.5,
	},
	ctaArrow: {
		opacity: 0.5,
	},
});
