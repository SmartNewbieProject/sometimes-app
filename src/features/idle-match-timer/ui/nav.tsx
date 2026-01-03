import { ImageResources } from '@/src/shared/libs';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Button, ImageResource, Text } from '@/src/shared/ui';
import { Text as RNText, StyleSheet, View, Pressable, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import type { MatchDetails } from '../types';

import { useFeatureCost } from '@features/payment/hooks';
import { useModal } from '@hooks/use-modal';
import { useTranslation } from 'react-i18next';
import useILiked from '../../like/hooks/use-liked';
import { LikeButton } from '../../like/ui/like-button';
import useRematch from '../hooks/use-rematch';

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

type InteractionNavigationProps = {
	match?: MatchDetails;
};

export const InteractionNavigation = ({ match }: InteractionNavigationProps) => {
	const hasPartner = !!match?.partner;
	const isPendingApproval = match?.type === 'pending-approval';
	const { onRematch } = useRematch();
	const { showModal, hideModal } = useModal();
	const { featureCosts } = useFeatureCost();
	const { isLikedPartner } = useILiked();
	const isLiked = isLikedPartner(match?.connectionId ?? '');
	const { t } = useTranslation();

	if (isPendingApproval) {
		return null;
	}
	const showPartnerFindAnnouncement = () => {
		showModal({
			showLogo: true,

			customTitle: (
				<View
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						width: '100%',
					}}
				>
					<Text textColor="black" weight="bold" size="20">
						{t('features.idle-match-timer.ui.nav.modal_title_1')}
					</Text>
					<Text textColor="black" weight="bold" size="20">
						{t('features.idle-match-timer.ui.nav.modal_title_2', {
							count: featureCosts?.REMATCHING,
						})}
					</Text>
				</View>
			),
			children: (
				<View style={styles.modalContent}>
					<Text textColor="disabled" size="12">
						{t('features.idle-match-timer.ui.nav.modal_text_1')}
					</Text>
					<Text textColor="disabled" size="12">
						{t('features.idle-match-timer.ui.nav.modal_text_2')}
					</Text>
				</View>
			),
			primaryButton: {
				text: t('features.idle-match-timer.ui.nav.primary_button'),
				onClick: onRematch,
			},
			secondaryButton: {
				text: t('no'),
				onClick: hideModal,
			},
		});
	};

	const renderMainButton = () => {
		if (hasPartner) {
			return (
				<Button
					onPress={showPartnerFindAnnouncement}
					variant="white"
					styles={styles.navButton}
					prefix={
						<ImageResource
							resource={ImageResources.GEM}
							width={32}
							height={32}
							style={{ marginRight: 6 }}
						/>
					}
				>
					<View style={styles.buttonContent}>
						<RNText style={styles.subText}>x{featureCosts?.REMATCHING}</RNText>
						<RNText style={styles.buttonTextBlack}>
							{t('features.idle-match-timer.ui.nav.main_button')}
						</RNText>
					</View>
				</Button>
			);
		}

		return (
			<GlowButton onPress={showPartnerFindAnnouncement}>
				<ImageResource
					resource={ImageResources.GEM}
					width={26}
					height={26}
					style={{ marginRight: 4 }}
				/>
				<RNText style={styles.buttonTextInverse}>
					{t('features.idle-match-timer.ui.nav.main_button')}
				</RNText>
			</GlowButton>
		);
	};

	return (
		<View style={styles.navContainer}>
			<View style={styles.buttonWrapper}>{renderMainButton()}</View>
			{isLiked ? (
				<View style={styles.buttonWrapper}>
					<Button onPress={() => {}} styles={styles.completedButton}>
						{t('features.idle-match-timer.ui.nav.complete_button')}
					</Button>
				</View>
			) : hasPartner ? (
				<View style={styles.buttonWrapper}>
					{/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
					<LikeButton
						connectionId={match.connectionId!}
						matchId={match.id!}
						nickname={match.partner?.name ?? ''}
						profileUrl={match.partner?.profileImages[0]?.url ?? ''}
						canLetter={match.canLetter}
					/>
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	subText: {
		fontSize: 16,
		fontFamily: 'Pretendard-Medium',
		fontWeight: '500',
		paddingRight: 4,
		lineHeight: 20,
		color: semanticColors.text.secondary,
		flexShrink: 0,
	},
	modalContent: {
		flexDirection: 'column',
		width: '100%',
		alignItems: 'center',
		marginTop: 8,
	},
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
		borderWidth: 3,
		borderColor: semanticColors.border.default,
		borderRadius: 16,
	},
	navButtonFull: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
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
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'nowrap',
	},
	buttonTextBlack: {
		fontSize: 18,
		fontFamily: 'Pretendard-Medium',
		fontWeight: '500',
		color: semanticColors.text.secondary,
		flexShrink: 0,
	},
	buttonTextInverse: {
		fontSize: 20,
		fontWeight: '700',
		color: semanticColors.text.inverse,
		flexShrink: 0,
	},
	completedButton: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: semanticColors.surface.other,
	},
});
