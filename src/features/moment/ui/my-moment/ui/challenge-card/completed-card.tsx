import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

export const CompletedCard = () => {
	const { t } = useTranslation();

		return (
			<View style={styles.container}>
				<Text style={styles.emoji}>
					🎉
				</Text>
			<View style={styles.textContainer}>
				<Text size="md" weight="bold" textColor="purple" style={styles.title}>
					{t('features.moment.my_moment.challenge_card.completed_title')}
				</Text>
				<Text size="12" weight="normal" textColor="gray" style={styles.subtitle}>
					{t('features.moment.my_moment.challenge_card.completed_subtitle')}
				</Text>
				<View style={styles.rewardRow}>
					<Image
						source={require('@/assets/images/promotion/home-banner/gem.webp')}
						style={styles.gemIcon}
						resizeMode="contain"
					/>
					<Text size="12" weight="medium" textColor="purple">
						{t('features.moment.my_moment.challenge_card.completed_reward')}
					</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.moreLightPurple,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.lightPurple,
		marginHorizontal: 20,
		marginBottom: 20,
		marginTop: 10,
		paddingVertical: 20,
		paddingHorizontal: 20,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	emoji: {
		fontSize: 32,
		lineHeight: 40,
	},
	textContainer: {
		flex: 1,
		gap: 4,
	},
	title: {
		marginBottom: 2,
	},
	subtitle: {},
	rewardRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginTop: 8,
	},
	gemIcon: {
		width: 18,
		height: 18,
	},
});
