import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { ImageResources } from '@/src/shared/libs';
import { Button, ImageResource, Text } from '@/src/shared/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import { useFirstGlobalMatch } from '../hooks/use-first-global-match';
import { useGlobalLike } from '../hooks/use-global-like';
import { useGlobalRematch } from '../hooks/use-global-rematch';
import type { GlobalMatchDetails } from '../types';
import { isOpenGlobalMatch } from '../types';

type GlowButtonProps = {
	onPress: () => void;
	children: React.ReactNode;
};

const GlowButton = ({ onPress, children }: GlowButtonProps) => {
	const translateX = useRef(new Animated.Value(-1)).current;
	const [containerW, setContainerW] = useState(0);

	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(translateX, {
					toValue: 1,
					duration: 2000,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.delay(500),
				Animated.timing(translateX, {
					toValue: -1,
					duration: 0,
					useNativeDriver: true,
				}),
			]),
		);
		loop.start();
		return () => loop.stop();
	}, [translateX]);

	const animatedStyle = {
		transform: [
			{
				translateX: translateX.interpolate({
					inputRange: [-1, 1],
					outputRange: [-containerW, containerW],
				}),
			},
		],
	};

	return (
		<Pressable
			onPress={onPress}
			onLayout={(e) => setContainerW(e.nativeEvent.layout.width || 0)}
			style={styles.gradientButtonContainer}
		>
			<LinearGradient
				colors={['#9B6DFF', '#7A4AE2', '#6B3FD4']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.gradientButton}
			>
				{children}
			</LinearGradient>
			<Animated.View style={[styles.glowOverlay, animatedStyle]}>
				<LinearGradient
					colors={[
						'transparent',
						'rgba(255,255,255,0.05)',
						'rgba(255,255,255,0.15)',
						'rgba(255,255,255,0.2)',
						'rgba(255,255,255,0.15)',
						'rgba(255,255,255,0.05)',
						'transparent',
					]}
					locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 1]}
					start={{ x: 0, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
		</Pressable>
	);
};

type GlobalNavProps = {
	match: GlobalMatchDetails | undefined;
	preferenceOptionIds?: string[] | null;
};

export const GlobalNav = ({ match, preferenceOptionIds }: GlobalNavProps) => {
	const { t } = useTranslation();
	const { showModal, hideModal } = useModal();
	const { onGlobalLike, isLikePending } = useGlobalLike();
	const { onGlobalRematch, isRematchPending, rematchCost } = useGlobalRematch();
	const { isFirstGlobalMatch } = useFirstGlobalMatch();

	const isPartnerOpen = match && isOpenGlobalMatch(match);

	const handleRematch = () => {
		showModal({
			showLogo: true,
			title: isFirstGlobalMatch
				? t('features.global-matching.first_match_confirm_title')
				: t('features.global-matching.rematch_confirm_title'),
			children: (
				<View style={styles.modalContent}>
					<Text textColor="disabled" size="12">
						{isFirstGlobalMatch
							? t('features.global-matching.first_match_confirm_description')
							: t('features.global-matching.rematch_confirm_description')}
					</Text>
				</View>
			),
			primaryButton: {
				text: isFirstGlobalMatch
					? t('features.global-matching.first_match_button')
					: t('features.global-matching.rematch_button'),
				onClick: async () => {
					hideModal();
					await onGlobalRematch(preferenceOptionIds ?? undefined);
				},
			},
			secondaryButton: {
				text: t('no'),
				onClick: hideModal,
			},
		});
	};

	const handleLike = () => {
		if (!isPartnerOpen) return;

		showModal({
			showLogo: true,
			title: t('features.global-matching.like_confirm_title'),
			children: (
				<View style={styles.modalContent}>
					<Text textColor="disabled" size="12">
						{t('features.global-matching.like_confirm_description')}
					</Text>
				</View>
			),
			primaryButton: {
				text: t('features.global-matching.like_button'),
				onClick: async () => {
					await onGlobalLike(match.connectionId);
				},
			},
			secondaryButton: {
				text: t('no'),
				onClick: hideModal,
			},
		});
	};

	if (isPartnerOpen) {
		return (
			<View style={styles.navContainer}>
				<View style={styles.buttonWrapper}>
					<Button
						onPress={handleRematch}
						variant="white"
						styles={styles.navButton}
						disabled={isRematchPending}
						prefix={
							<ImageResource
								resource={ImageResources.GEM}
								width={24}
								height={24}
								style={{ marginRight: 4 }}
							/>
						}
					>
						<View style={styles.buttonContent}>
							<RNText style={styles.costText}>x{rematchCost}</RNText>
							<RNText style={styles.buttonTextBlack}>
								{t('features.global-matching.rematch_button')}
							</RNText>
						</View>
					</Button>
				</View>
				<View style={styles.buttonWrapper}>
					<Button
						onPress={handleLike}
						variant="primary"
						styles={styles.navButton}
						disabled={isLikePending}
						prefix={
							<ImageResource
								resource={ImageResources.GEM}
								width={24}
								height={24}
								style={{ marginRight: 4 }}
							/>
						}
					>
						<RNText style={styles.buttonTextWhite}>
							{t('features.global-matching.like_button')}
						</RNText>
					</Button>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.navContainer}>
			<View style={styles.buttonWrapper}>
				<GlowButton onPress={handleRematch}>
					<ImageResource
						resource={ImageResources.GEM}
						width={26}
						height={26}
						style={{ marginRight: 4 }}
					/>
					<RNText style={styles.buttonTextInverse}>
						{isFirstGlobalMatch
							? preferenceOptionIds
								? t('features.global-matching.first_match_start_with_prefs')
								: t('features.global-matching.first_match_quick_start')
							: t('features.global-matching.rematch_button')}
					</RNText>
				</GlowButton>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	navContainer: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 16,
	},
	buttonWrapper: {
		flex: 1,
	},
	navButton: {
		width: '100%',
		alignItems: 'center',
		height: 56,
		borderRadius: 16,
	},
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'nowrap',
	},
	costText: {
		fontSize: 16,
		fontFamily: 'Pretendard-Medium',
		fontWeight: '500',
		paddingRight: 4,
		lineHeight: 20,
		color: semanticColors.text.secondary,
		flexShrink: 0,
	},
	buttonTextBlack: {
		fontSize: 18,
		fontFamily: 'Pretendard-Medium',
		fontWeight: '500',
		color: semanticColors.text.secondary,
	},
	buttonTextWhite: {
		fontSize: 18,
		fontFamily: 'Pretendard-Medium',
		fontWeight: '500',
		color: semanticColors.text.inverse,
	},
	buttonTextInverse: {
		fontSize: 20,
		fontWeight: '700',
		color: semanticColors.text.inverse,
		flexShrink: 0,
	},
	gradientButtonContainer: {
		flex: 1,
		width: '100%',
		borderRadius: 16,
		borderWidth: 3,
		borderColor: '#6B3FD4',
		overflow: 'hidden',
	},
	gradientButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 14,
		paddingHorizontal: 24,
		gap: 4,
		flexWrap: 'nowrap',
	},
	glowOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
	},
	modalContent: {
		flexDirection: 'column',
		width: '100%',
		alignItems: 'center',
		marginTop: 8,
	},
});
