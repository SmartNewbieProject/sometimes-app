import { ExternalRegionBadge } from '@/src/features/matching/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { dayUtils } from '@/src/shared/libs';
import { IconWrapper } from '@/src/shared/ui/icons';
import ArrowRight from '@assets/icons/right-white-arrow.svg';
import { Text } from '@shared/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { calculateTime } from '../../idle-match-timer/services/calculate-time';
import Time from '../../idle-match-timer/ui/time';
import type { OpenGlobalMatch } from '../types';
import { TranslatedField } from './translated-field';

type GlobalPartnerCardProps = {
	match: OpenGlobalMatch;
};

export const GlobalPartnerCard = ({ match }: GlobalPartnerCardProps) => {
	const { partner } = match;
	const { t } = useTranslation();
	const { delimeter, value } = calculateTime(match.endOfView, dayUtils.create());

	const countryFlag = partner.country === 'jp' ? '🇯🇵' : '🇰🇷';
	const countryLabel =
		partner.country === 'jp'
			? t('features.global-matching.country_jp')
			: t('features.global-matching.country_kr');

	const onClickToPartner = () => {
		router.navigate({
			pathname: '/partner/view/[id]',
			params: { id: match.id, redirectTo: encodeURIComponent('/home') },
		});
	};

	return (
		<View style={styles.container}>
			<View style={styles.timerContainer}>
				<Time size="sm" value={delimeter} />
				<Time size="sm" value="-" />
				{value
					?.toString()
					.split('')
					.map((char, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: timer digit display
						<Time size="sm" key={`${char}-${index}`} value={char} />
					))}
			</View>

			<View style={styles.countryBadgeContainer}>
				<View style={styles.countryBadge}>
					<Text style={styles.countryFlag}>{countryFlag}</Text>
					<Text style={styles.countryLabel}>{countryLabel}</Text>
				</View>
			</View>

			{partner.country && (
				<View style={styles.externalBadgeContainer}>
					<ExternalRegionBadge
						external={{
							region: partner.country,
							requestedRegion: partner.country === 'jp' ? 'JP' : 'KR',
							matchedRegion: partner.country === 'jp' ? 'KR' : 'JP',
						}}
						variant="overlay"
					/>
				</View>
			)}

			<View style={styles.infoContainer}>
				<Text textColor="white" weight="bold" size="xl">
					{t('features.idle-match-timer.ui.partner.age_prefix', { age: partner.age })}
				</Text>

				<TranslatedField
					translated={partner.university}
					original={partner.universityOriginal}
					style={styles.universityText}
				/>

				{partner.keywords && partner.keywords.length > 0 && (
					<View style={styles.keywordsContainer}>
						{partner.keywords.slice(0, 3).map((keyword) => (
							<View key={keyword} style={styles.keywordTag}>
								<Text textColor="white" size="xs">
									#{keyword}
								</Text>
							</View>
						))}
					</View>
				)}
			</View>

			<View style={styles.moreButtonContainer}>
				<TouchableOpacity style={styles.moreButton} onPress={onClickToPartner}>
					<Text style={styles.moreButtonText} textColor="white">
						{t('features.idle-match-timer.ui.partner.button_more')}
					</Text>
					<IconWrapper width={12} height={12}>
						<ArrowRight />
					</IconWrapper>
				</TouchableOpacity>
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
	countryBadgeContainer: {
		position: 'absolute',
		top: 16,
		right: 16,
		zIndex: 10,
	},
	countryBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 16,
		gap: 4,
	},
	countryFlag: {
		fontSize: 14,
	},
	countryLabel: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
	},
	externalBadgeContainer: {
		position: 'absolute',
		top: 50,
		right: 16,
		zIndex: 10,
	},
	infoContainer: {
		position: 'absolute',
		flexDirection: 'column',
		left: 12,
		bottom: 28,
		zIndex: 10,
		maxWidth: '70%',
	},
	universityText: {
		color: '#FFFFFF',
		fontSize: 14,
		marginTop: 2,
	},
	keywordsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
		marginTop: 6,
	},
	keywordTag: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 12,
	},
	moreButtonContainer: {
		position: 'absolute',
		right: 0,
		bottom: 62,
		zIndex: 10,
	},
	moreButton: {
		backgroundColor: semanticColors.brand.primary,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderTopLeftRadius: 16,
		borderBottomLeftRadius: 16,
		gap: 4,
	},
	moreButtonText: {
		fontSize: 12,
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
