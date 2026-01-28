import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { ExternalMatchInfo } from '@/src/types/user';
import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

const ExternalConnectionIcon = require('@assets/images/external-connection.png');

type ExternalRegionBadgeProps = {
	external: ExternalMatchInfo;
	variant: 'overlay' | 'inline' | 'banner';
};

export const ExternalRegionBadge = ({ external, variant }: ExternalRegionBadgeProps) => {
	const { t } = useTranslation();

	if (variant === 'banner') {
		const bannerText = t('features.matching.ui.external_region_badge.banner_text', {
			from: external.requestedRegion,
			to: external.matchedRegion,
		});

		return (
			<View style={styles.bannerContainer}>
				<Image source={ExternalConnectionIcon} style={styles.bannerIcon} />
				<Text style={styles.bannerText}>{bannerText}</Text>
			</View>
		);
	}

	const text = `${external.requestedRegion} → ${external.matchedRegion}`;

	return (
		<View style={variant === 'overlay' ? styles.overlayContainer : styles.inlineContainer}>
			<Text style={variant === 'overlay' ? styles.overlayText : styles.inlineText}>{text}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	overlayContainer: {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	overlayText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
	},
	inlineContainer: {
		backgroundColor: semanticColors.surface.tertiary,
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 12,
	},
	inlineText: {
		color: semanticColors.brand.primary,
		fontSize: 11,
		fontWeight: '500',
		fontFamily: 'Pretendard-Medium',
	},
	bannerContainer: {
		backgroundColor: semanticColors.surface.background,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	bannerIcon: {
		width: 38,
		height: 15,
	},
	bannerText: {
		color: semanticColors.text.secondary,
		fontSize: 13,
		fontWeight: '500',
		fontFamily: 'Pretendard-Medium',
	},
});
