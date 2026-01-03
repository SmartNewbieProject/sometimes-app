import NotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import { UniversityName, dayUtils, getUnivLogo, formatLastLogin } from '@/src/shared/libs';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { IconWrapper } from '@/src/shared/ui/icons';
import ArrowRight from '@assets/icons/right-white-arrow.svg';
import { Text } from '@shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRegularMatchingReviewTrigger } from '@/src/features/in-app-review';

import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useMatchingBackground } from '../hooks';
import { calculateTime } from '../services/calculate-time';
import type { MatchDetails } from '../types';
import { sideStyle } from './constants';
import Time from './time';
import { useTranslation } from 'react-i18next';

type PartnerProps = {
	match: MatchDetails;
};

export const Partner = ({ match }: PartnerProps) => {
	const { partner } = match;
	const { update } = useMatchingBackground();
	const { t } = useTranslation();
	const { delimeter, value } = calculateTime(match.endOfView, dayUtils.create());
	const [hasViewedMatch, setHasViewedMatch] = useState(false);

	// 인앱 리뷰: 정기매칭 결과 확인 시 리뷰 요청
	useEffect(() => {
		if (partner) {
			setHasViewedMatch(true);
		}
	}, [partner]);

	useRegularMatchingReviewTrigger({
		hasViewedMatch,
		matchType: 'open',
		enabled: true,
	});

	const onClickToPartner = () => {
		return router.navigate({
			pathname: '/partner/view/[id]',
			params: { id: match.id, redirectTo: encodeURIComponent('/home') },
		});
	};

	useEffect(() => {
		const mainProfileImageUri =
			partner?.profileImages?.find((image) => image.isMain)?.imageUrl ||
			partner?.profileImages?.find((image) => image.isMain)?.url ||
			partner?.profileImages?.[0]?.imageUrl ||
			partner?.profileImages?.[0]?.url;
		if (!mainProfileImageUri) return;
		update(mainProfileImageUri);
	}, [partner?.profileImages, update]);

	const getUniversityLogoUrl = () => {
		if (partner?.universityDetails?.authentication) {
			const univName = partner?.universityDetails?.name as UniversityName;
			if (Object.values(UniversityName).includes(univName)) {
				return getUnivLogo(univName);
			}
		}
		return null;
	};

	const datingStyle = partner?.characteristics
		?.find((char) => char.typeName === t('ui.연애_스타일'))
		?.selectedOptions?.slice(0, 2);

	return (
		<View style={styles.container}>
			<View style={styles.timerContainer}>
				<Time size="sm" value={delimeter} />
				<Time size="sm" value="-" />
				{value
					?.toString()
					.split('')
					.map((char, index) => (
						<Time size="sm" key={`${char}-${index}`} value={char} />
					))}
			</View>

			<View style={styles.infoContainer}>
				<Text textColor="white" weight="bold" size="xl">
					{t('features.idle-match-timer.ui.partner.age_prefix', { age: partner?.age })}
				</Text>

				<View style={styles.tagsRow}>
					{partner?.mbti && (
						<Text textColor="white" weight="light" size="md">
							#{partner.mbti}
						</Text>
					)}
					{partner?.universityDetails?.name && (
						<Text textColor="white" weight="light" size="md">
							{' '}
							#{partner.universityDetails.name}
						</Text>
					)}
					{(() => {
						const logoUrl = getUniversityLogoUrl();
						return partner?.universityDetails?.authentication && logoUrl ? (
							<Image source={{ uri: logoUrl }} style={styles.universityLogo} />
						) : (
							<IconWrapper style={styles.notSecuredIcon} size={14}>
								<NotSecuredIcon />
							</IconWrapper>
						);
					})()}
				</View>

				{datingStyle && datingStyle.length > 0 && (
					<View style={styles.datingStyleContainer}>
						{datingStyle.map((style) => (
							<View key={style.id} style={styles.datingStyleTag}>
								<Text textColor="white" size="xs">
									{style.displayName}
								</Text>
							</View>
						))}
					</View>
				)}

				<View style={styles.lastAccessBadge}>
					<Text textColor="white" weight="medium" size="sm">
						{t('features.idle-match-timer.ui.partner.last_access')}
					</Text>
					<Text textColor="white" weight="light" size="sm">
						{formatLastLogin(partner?.updatedAt)}
					</Text>
				</View>
			</View>

			<View style={styles.moreButtonContainer}>
				<View style={styles.moreButtonTopSpacer}>
					<View style={styles.moreButtonTopRadius} />
				</View>

				<View style={styles.moreButtonRow}>
					<TouchableOpacity
						style={[sideStyle.previousButton, styles.moreButton]}
						onPress={onClickToPartner}
					>
						<Text style={styles.moreButtonText} textColor="white">
							{t('features.idle-match-timer.ui.partner.button_more')}
						</Text>
						<IconWrapper width={12} height={12}>
							<ArrowRight />
						</IconWrapper>
					</TouchableOpacity>
				</View>

				<View style={styles.moreButtonBottomSpacer}>
					<View style={styles.moreButtonBottomRadius} />
				</View>
			</View>

			<LinearGradient colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)']} style={styles.gradient} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		width: '100%',
		height: '100%',
		padding: 14,
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	timerContainer: {
		flexDirection: 'row',
		gap: 2,
	},
	infoContainer: {
		position: 'absolute',
		flexDirection: 'column',
		left: 12,
		bottom: 28,
		zIndex: 10,
		maxWidth: '70%',
	},
	tagsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 2,
	},
	universityLogo: {
		width: 14,
		height: 14,
		marginLeft: 5,
	},
	notSecuredIcon: {
		marginLeft: 5,
	},
	datingStyleContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
		marginTop: 6,
	},
	datingStyleTag: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 12,
	},
	lastAccessBadge: {
		backgroundColor: '#7A4AE2',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		alignSelf: 'flex-start',
		marginTop: 6,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	moreButtonContainer: {
		position: 'absolute',
		width: 58,
		flexDirection: 'column',
		height: 128,
		backgroundColor: 'transparent',
		right: 0,
		zIndex: 10,
		bottom: 62,
	},
	moreButtonTopSpacer: {
		width: '100%',
		position: 'relative',
		backgroundColor: 'transparent',
		overflow: 'hidden',
	},
	moreButtonTopRadius: {
		borderBottomRightRadius: 16,
		borderTopEndRadius: 16,
		height: 35,
		width: '100%',
		borderColor: semanticColors.border.default,
	},
	moreButtonRow: {
		width: '100%',
		flexDirection: 'row',
	},
	moreButton: {
		backgroundColor: semanticColors.brand.primary,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingRight: 4,
	},
	moreButtonText: {
		width: 32,
		fontSize: 12,
	},
	moreButtonBottomSpacer: {
		width: '100%',
		position: 'relative',
		overflow: 'hidden',
	},
	moreButtonBottomRadius: {
		borderTopEndRadius: 16,
		height: 35,
		width: '100%',
	},
	gradient: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		left: 0,
		right: 0,
		height: '40%',
	},
});
