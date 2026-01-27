import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { dayUtils } from '@/src/shared/libs';
import { PROFILE_VIEWER_KEYS } from '@/src/shared/libs/locales/keys';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import CircleCheckIcon from '@assets/icons/circle-check.svg';
import LockProfileIcon from '@assets/icons/lock-profile.svg';
import ArrowRight from '@assets/icons/right-white-arrow.svg';
import { BlurView } from 'expo-blur';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useRevealCost } from '../queries';
import { type ProfileViewerItem, ViewerInteractionStatus } from '../type';

interface ViewerCardProps {
	item: ProfileViewerItem;
	onReveal: (summaryId: string, canUnlockFree: boolean) => void;
	onLike: (summaryId: string) => void;
	onPress?: (summaryId: string) => void;
	isFreeUnlockTarget?: boolean;
}

export const ViewerCard = ({
	item,
	onReveal,
	onLike,
	onPress,
	isFreeUnlockTarget,
}: ViewerCardProps) => {
	const { t } = useTranslation();
	const { data: costData } = useRevealCost();
	const revealCost = costData?.cost ?? 0;

	// 리스트 paddingHorizontal: 4 (양쪽 8px) + 카드 marginHorizontal: 4 (양쪽 8px per card)
	// 중간 갭: 4 + 4 = 8px
	// 총 공제: 8 + 8 + 8 = 24px
	const size =
		Dimensions.get('window').width > 468 ? 218 : (Dimensions.get('window').width - 24) / 2;

	const { summaryId, viewCount, lastViewAt, isRevealed, hint, canUnlockFree, isLiked, profile } =
		item;

	const relativeTime = dayUtils.formatRelativeTime(lastViewAt);

	const handleCardPress = () => {
		if (isRevealed && onPress) {
			onPress(summaryId);
		} else if (!isRevealed) {
			onReveal(summaryId, isFreeUnlockTarget || canUnlockFree);
		}
	};

	const handleActionButtonPress = () => {
		if (!isRevealed) {
			onReveal(summaryId, isFreeUnlockTarget || canUnlockFree);
		} else if (!isLiked) {
			onLike(summaryId);
		}
	};

	const viewCountText =
		viewCount >= 5
			? t(PROFILE_VIEWER_KEYS.viewedMeCardViewCountMore)
			: t(PROFILE_VIEWER_KEYS.viewedMeCardViewCount, { count: viewCount });

	const getButtonText = () => {
		if (!isRevealed) {
			return canUnlockFree
				? t(PROFILE_VIEWER_KEYS.viewedMeCardFreeUnlock)
				: t(PROFILE_VIEWER_KEYS.viewedMeCardRevealButton);
		}
		return t(PROFILE_VIEWER_KEYS.viewedMeCardLikeButton);
	};

	const displayName = isRevealed && profile?.name ? profile.name : `${hint.age}`;
	const displayAge = isRevealed && profile?.age ? `${profile.age}` : `${hint.age}`;

	// 상태 라벨 결정
	const getStatusLabel = (): {
		text: string;
		backgroundColor: string;
		textColor: 'primary' | 'inverse';
	} | null => {
		const status = item.interactionStatus;
		if (!status) return null;

		switch (status) {
			case ViewerInteractionStatus.LIKE_SENT:
				return {
					text: t(PROFILE_VIEWER_KEYS.interactionStatusILiked),
					backgroundColor: '#FFFFFF',
					textColor: 'primary' as const,
				};
			case ViewerInteractionStatus.LIKED_ME:
				return {
					text: t(PROFILE_VIEWER_KEYS.interactionStatusTheyLiked),
					backgroundColor: '#FFFFFF',
					textColor: 'primary' as const,
				};
			case ViewerInteractionStatus.MATCHING:
				return {
					text: t(PROFILE_VIEWER_KEYS.interactionStatusMutual),
					backgroundColor: '#FFFFFF',
					textColor: 'primary' as const,
				};
			default:
				return null;
		}
	};

	const statusLabel = getStatusLabel();

	// 무료 오픈 라벨은 nextFreeUnlock.summaryId와 일치하는 카드에만 표시
	const showFreeLabel = !isRevealed && isFreeUnlockTarget;

	return (
		<Pressable onPress={handleCardPress}>
			<ImageBackground
				source={{ uri: hint.blurredImageUrl || 'https://via.placeholder.com/200' }}
				style={[styles.imageBackground, { width: size, height: size }]}
			>
				{!isRevealed && (
					<>
						<BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
						<View style={styles.lockIconContainer}>
							<LockProfileIcon width={32} height={32} />
						</View>
					</>
				)}

				{/* 상태 라벨 (interaction status) */}
				{statusLabel && (
					<View style={[styles.statusLabel, { backgroundColor: statusLabel.backgroundColor }]}>
						<Text size="10" weight="bold" textColor={statusLabel.textColor}>
							{statusLabel.text}
						</Text>
					</View>
				)}

				{/* 무료 오픈 라벨 (상태 라벨이 없을 때만) */}
				{showFreeLabel && (
					<View style={styles.freeUnlockLabel}>
						<Text size="10" weight="bold" textColor="inverse">
							무료 오픈!
						</Text>
					</View>
				)}

				<View style={[styles.cardContainer, { width: size, height: size }]}>
					<View style={styles.infoContainer}>
						<Text textColor="white" weight="semibold" size="20">
							{isRevealed ? profile?.name || displayAge : displayAge}
						</Text>
						<View style={styles.rowCenter}>
							<Text textColor="white" weight="light" size="10">
								#{hint.universityName}
							</Text>
						</View>
						<View style={styles.viewCountBadge}>
							<Text textColor="white" weight="medium" size="10">
								{viewCountText}
							</Text>
							<Text textColor="white" weight="light" size="10">
								{relativeTime}
							</Text>
						</View>
					</View>

					<View style={styles.actionButtonContainer}>
						<View style={styles.topSpacer}>
							<View style={styles.topSpacerInner} />
						</View>

						<View style={styles.fullWidthRow}>
							{isLiked ? (
								<View style={[styles.likedBadge, styles.pressableContent]}>
									<CircleCheckIcon width={12} height={12} color="#FFFFFF" />
									<Text textColor="white" style={styles.buttonText}>
										{t(PROFILE_VIEWER_KEYS.viewedMeCardLikedLabel)}
									</Text>
								</View>
							) : (
								<Pressable
									style={[
										styles.actionButton,
										styles.pressableContent,
										{
											backgroundColor: !isRevealed ? '#452D79' : colors.primaryPurple,
										},
									]}
									onPress={handleActionButtonPress}
								>
									<Text textColor="white" style={styles.buttonText}>
										{getButtonText()}
									</Text>
									<IconWrapper width={6} height={6}>
										<ArrowRight />
									</IconWrapper>
								</Pressable>
							)}
						</View>
						<View style={styles.bottomContainer}>
							<View style={styles.bottomSpacerInner} />
						</View>
					</View>

					<LinearGradient
						colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)']}
						style={[styles.gradientOverlay, { width: size }]}
					/>
				</View>
			</ImageBackground>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	imageBackground: {
		flex: 1,
		borderRadius: 20,
		overflow: 'hidden',
		marginVertical: 8,
		marginHorizontal: 4,
	},
	freeUnlockLabel: {
		position: 'absolute',
		top: 10,
		left: 10,
		backgroundColor: semanticColors.brand.primary,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		zIndex: 20,
	},
	statusLabel: {
		position: 'absolute',
		top: 10,
		right: 10,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		zIndex: 20,
	},
	lockIconContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 10,
	},
	cardContainer: {
		position: 'relative',
		padding: 14,
		borderRadius: 30,
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	infoContainer: {
		position: 'absolute',
		flexDirection: 'column',
		left: 10,
		bottom: 10,
		zIndex: 10,
	},
	rowCenter: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	viewCountBadge: {
		backgroundColor: '#7A4AE2',
		paddingHorizontal: 6,
		paddingVertical: 3,
		borderRadius: 3,
		alignSelf: 'flex-start',
		marginTop: 3,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	actionButtonContainer: {
		position: 'absolute',
		width: 34,
		flexDirection: 'column',
		height: 128,
		backgroundColor: 'transparent',
		right: 1,
		zIndex: 10,
		bottom: 62,
	},
	topSpacer: {
		width: '100%',
		position: 'relative',
		backgroundColor: 'transparent',
		overflow: 'hidden',
	},
	topSpacerInner: {
		borderBottomRightRadius: 16,
		borderTopEndRadius: 16,
		height: 35,
		width: '100%',
	},
	fullWidthRow: {
		width: '100%',
		flexDirection: 'row',
	},
	pressableContent: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingRight: 4,
	},
	actionButton: {
		borderTopLeftRadius: 999,
		borderBottomLeftRadius: 999,
		height: 68,
	},
	likedBadge: {
		borderTopLeftRadius: 999,
		borderBottomLeftRadius: 999,
		height: 68,
		backgroundColor: semanticColors.brand.primary,
		gap: 2,
	},
	buttonText: {
		width: 20,
		fontSize: 7,
	},
	bottomContainer: {
		width: '100%',
		position: 'relative',
		overflow: 'hidden',
	},
	bottomSpacerInner: {
		borderTopEndRadius: 16,
		height: 35,
		width: '100%',
	},
	gradientOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: '40%',
	},
});
