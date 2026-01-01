import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet } from 'react-native';
import { semanticColors } from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui/text';

interface PhotoStatusCardProps {
	approvedCount: number;
	maxCount?: number;
}

export function PhotoStatusCard({ approvedCount, maxCount = 3 }: PhotoStatusCardProps) {
	const { t } = useTranslation();
	const level = approvedCount;
	const isMaxLevel = approvedCount >= maxCount;

	return (
		<View style={styles.container}>
			<View style={styles.badge}>
				<Text weight="semibold" size="xs" textColor="purple">
					{t('widgets.photo-status-card.current_level', { level })}
				</Text>
			</View>

			<View style={styles.titleContainer}>
				<Text weight="semibold" size="xl" textColor="black">
					{t('widgets.photo-status-card.title_prefix')}
				</Text>
				<View style={styles.highlightRow}>
					<Text weight="semibold" size="xl" textColor="purple">
						{t('widgets.photo-status-card.photo_count', { count: level })}
					</Text>
					<Text weight="semibold" size="xl" textColor="black">
						{' '}
						{t('widgets.photo-status-card.title_suffix')}
					</Text>
				</View>
			</View>

			<Text weight="medium" size="sm" textColor="secondary" style={styles.description}>
				{isMaxLevel
					? t('widgets.photo-status-card.max_level_description')
					: t('widgets.photo-status-card.description')}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: '#FFFFFF',
		shadowColor: semanticColors.brand.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 2,
	},
	badge: {
		alignSelf: 'flex-start',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 20,
		marginBottom: 12,
	},
	titleContainer: {
		marginBottom: 8,
	},
	highlightRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	description: {
		lineHeight: 21,
	},
});
