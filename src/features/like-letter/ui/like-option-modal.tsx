import colors from '@/src/shared/constants/colors';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { ImageResources } from '@/src/shared/libs';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { ImageResource, Text } from '@/src/shared/ui';
import { useCurrentGem, useFeatureCost } from '@features/payment/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { likeLetterApi } from '../api';
import type { LikeOption } from '../types';

type LikeOptionModalProps = {
	connectionId: string;
	matchId: string;
	nickname: string;
	profileUrl: string;
	canLetter?: boolean;
	source?: 'home' | 'profile';
	onSelect: (option: LikeOption) => void;
	onClose: () => void;
};

export function LikeOptionModal({
	connectionId,
	matchId,
	nickname,
	profileUrl,
	canLetter = false,
	source = 'profile',
	onSelect,
	onClose,
}: LikeOptionModalProps) {
	const { t } = useTranslation();
	const { redirectTo: currentRedirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
	const queryClient = useQueryClient();
	const { featureCosts } = useFeatureCost();
	const { data } = useCurrentGem();
	const currentGem = data?.totalGem ?? 0;
	const [isInsufficient, setIsInsufficient] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const simpleLikeCost = (featureCosts as Record<string, number>)?.LIKE_MESSAGE ?? 9;
	const baseLetterLikeCost = (featureCosts as Record<string, number>)?.LIKE_WITH_LETTER ?? 11;
	const letterLikeCost = canLetter ? 0 : baseLetterLikeCost;

	useEffect(() => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_LIKE_OPTION_MODAL_SHOWN, {
			connection_id: connectionId,
			match_id: matchId,
			entry_source: source,
			can_letter: canLetter,
			gem_balance: currentGem,
			letter_cost: letterLikeCost,
			simple_like_cost: simpleLikeCost,
		});
	}, []);

	const trackOptionSelected = (option: 'simple_like' | 'letter_like' | 'charge' | 'dismiss') => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_LIKE_OPTION_SELECTED, {
			connection_id: connectionId,
			match_id: matchId,
			entry_source: source,
			can_letter: canLetter,
			gem_balance: currentGem,
			option,
			had_sufficient_gems: currentGem >= letterLikeCost,
		});
	};

	const handleSimpleLike = () => {
		trackOptionSelected('simple_like');
		onSelect('simple');
	};

	const handleLetterLike = async () => {
		trackOptionSelected('letter_like');

		const basePath = source === 'home' ? '/home' : `/partner/view/${matchId}`;
		const fullRedirectPath = currentRedirectTo
			? `${basePath}?redirectTo=${currentRedirectTo}`
			: basePath;
		if (canLetter) {
			onClose();
			router.push({
				pathname: '/like-letter/write',
				params: {
					connectionId,
					matchId,
					nickname,
					profileUrl: encodeURIComponent(profileUrl),
					canLetter: 'true',
					source,
					redirectTo: encodeURIComponent(fullRedirectPath),
				},
			});
			return;
		}

		try {
			setIsLoading(true);
			if (currentGem < letterLikeCost) {
				mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_GEM_INSUFFICIENT, {
					connection_id: connectionId,
					match_id: matchId,
					gem_balance: currentGem,
					gem_required: letterLikeCost,
					gem_shortage: letterLikeCost - currentGem,
				});
				setIsInsufficient(true);
				return;
			}

			const gemBefore = currentGem;
			await likeLetterApi.getLetterPermission(connectionId);
			await queryClient.invalidateQueries({ queryKey: ['latest-matching-v2'] });

			mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_PERMISSION_PURCHASED, {
				connection_id: connectionId,
				match_id: matchId,
				gem_cost: letterLikeCost,
				gem_balance_before: gemBefore,
				gem_balance_after: gemBefore - letterLikeCost,
			});

			onClose();
			router.push({
				pathname: '/like-letter/write',
				params: {
					connectionId,
					matchId,
					nickname,
					profileUrl: encodeURIComponent(profileUrl),
					canLetter: 'true',
					source,
					redirectTo: encodeURIComponent(fullRedirectPath),
				},
			});
		} catch (error: unknown) {
			mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_GEM_INSUFFICIENT, {
				connection_id: connectionId,
				match_id: matchId,
				gem_balance: currentGem,
				gem_required: letterLikeCost,
				gem_shortage: letterLikeCost - currentGem,
			});
			setIsInsufficient(true);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoToCharge = () => {
		trackOptionSelected('charge');
		onClose();
		router.push('/purchase/gem-store');
	};

	const handleDismiss = () => {
		trackOptionSelected('dismiss');
		onClose();
	};

	if (isInsufficient) {
		return (
			<View style={styles.container}>
				<View style={styles.iconContainer}>
					<View style={styles.iconRing}>
						<View style={styles.iconInner}>
							<Image
								source={require('@assets/images/sometimelogo.webp')}
								style={styles.logoIcon}
								contentFit="contain"
							/>
						</View>
					</View>
				</View>

				<View style={styles.content}>
					<View style={styles.titleContainer}>
						<Text weight="bold" size="20" textColor="black" style={styles.titleText}>
							{t('features.like-letter.ui.insufficient_modal.title')}
						</Text>
					</View>

					<View style={styles.descriptionContainer}>
						<Text size="12" textColor="disabled" style={{ textAlign: 'center' }}>
							{t('features.like-letter.ui.insufficient_modal.description', {
								letterCost: baseLetterLikeCost,
								likeCost: simpleLikeCost,
							})}
						</Text>
					</View>

					<View style={styles.optionsContainer}>
						<Pressable style={styles.letterOption} onPress={handleGoToCharge}>
							<View style={styles.chargeContent}>
								<Text weight="medium" size="20" style={styles.letterLikeText}>
									{t('features.like-letter.ui.insufficient_modal.charge_and_write')}
								</Text>
								<Text size="12" style={styles.chargeSubText}>
									{t('features.like-letter.ui.insufficient_modal.charge_sub_text')}
								</Text>
							</View>
						</Pressable>

						<Pressable style={styles.simpleOption} onPress={handleSimpleLike}>
							<View style={styles.gemBadge}>
								<ImageResource resource={ImageResources.GEM} width={22} height={22} />
								<Text size="15" style={styles.gemCountLight}>
									x{simpleLikeCost}
								</Text>
							</View>
							<Text weight="medium" size="20" style={styles.simpleLikeText}>
								{t('features.like-letter.ui.insufficient_modal.send_simple_like')}
							</Text>
						</Pressable>
					</View>

					<Pressable onPress={handleDismiss} style={styles.closeButton}>
						<Text size="12" textColor="disabled" style={{ textDecorationLine: 'underline' }}>
							{t('features.like-letter.ui.insufficient_modal.later')}
						</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<View style={styles.iconRing}>
					<View style={styles.iconInner}>
						<Image
							source={require('@assets/images/sometimelogo.webp')}
							style={styles.logoIcon}
							contentFit="contain"
						/>
					</View>
				</View>
			</View>

			<View style={styles.content}>
				<View style={styles.titleContainer}>
					<Text weight="bold" size="20" textColor="black" style={styles.titleText}>
						{t('features.like-letter.ui.option_modal.title_line1')}
					</Text>
					<Text weight="bold" size="20" textColor="black" style={styles.titleText}>
						{t('features.like-letter.ui.option_modal.title_line2')}
					</Text>
				</View>

				<View style={styles.descriptionContainer}>
					<Text size="12" textColor="disabled">
						{t('features.like-letter.ui.option_modal.description_line1')}
					</Text>
					<Text size="12" textColor="disabled">
						{t('features.like-letter.ui.option_modal.description_line2')}
					</Text>
				</View>

				<View style={styles.optionsContainer}>
					<Pressable style={styles.simpleOption} onPress={handleSimpleLike}>
						<View style={styles.gemBadge}>
							<ImageResource resource={ImageResources.GEM} width={22} height={22} />
							<Text size="15" style={styles.gemCountLight}>
								x{simpleLikeCost}
							</Text>
						</View>
						<Text weight="medium" size="20" style={styles.simpleLikeText}>
							{t('features.like-letter.ui.option_modal.simple_like')}
						</Text>
					</Pressable>

					<Pressable style={styles.letterOption} onPress={handleLetterLike} disabled={isLoading}>
						<View style={styles.gemBadge}>
							<ImageResource resource={ImageResources.GEM} width={22} height={22} />
							<Text size="15" style={styles.gemCountLight}>
								x{letterLikeCost}
							</Text>
						</View>
						<Text weight="medium" size="20" style={styles.letterLikeText}>
							{isLoading ? t('features.like-letter.ui.option_modal.loading') : t('features.like-letter.ui.option_modal.letter_like')}
						</Text>
					</Pressable>
				</View>

				<Text size="10" textColor="disabled" style={styles.hint}>
					{t('features.like-letter.ui.option_modal.hint')}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.white,
		borderRadius: 20,
		paddingTop: 68,
		paddingBottom: 16,
		paddingHorizontal: 16,
		width: 313,
		alignItems: 'center',
	},
	iconContainer: {
		position: 'absolute',
		top: -40,
		alignSelf: 'center',
	},
	iconRing: {
		width: 79,
		height: 79,
		borderRadius: 40,
		backgroundColor: colors.white,
		borderWidth: 3,
		borderColor: colors.primaryPurple,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconInner: {
		width: 63,
		height: 63,
		borderRadius: 32,
		backgroundColor: colors.primaryPurple,
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoIcon: {
		width: 48,
		height: 48,
		borderRadius: 10,
	},
	content: {
		width: '100%',
		alignItems: 'center',
		gap: 11,
	},
	titleContainer: {
		alignItems: 'center',
		gap: 5,
	},
	titleText: {
		textAlign: 'center',
	},
	descriptionContainer: {
		alignItems: 'center',
		marginTop: -3,
	},
	optionsContainer: {
		width: '100%',
		gap: 11,
		marginTop: 4,
	},
	simpleOption: {
		height: 50,
		borderRadius: 20,
		borderWidth: 1.5,
		borderColor: colors.primaryPurple,
		backgroundColor: colors.white,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	letterOption: {
		height: 50,
		borderRadius: 20,
		backgroundColor: colors.primaryPurple,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	chargeContent: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 2,
	},
	chargeSubText: {
		color: 'rgba(255, 255, 255, 0.8)',
	},
	gemBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 1,
	},
	gemCountLight: {
		color: '#BEACFF',
	},
	simpleLikeText: {
		color: colors.primaryPurple,
	},
	letterLikeText: {
		color: colors.white,
	},
	hint: {
		textAlign: 'center',
		marginTop: 5,
	},
	closeButton: {
		marginTop: 5,
		padding: 5,
	},
});
