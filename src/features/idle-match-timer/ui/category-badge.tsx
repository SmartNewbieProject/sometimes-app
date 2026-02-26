import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import type { MatchCategory } from '../types-v31';
import { CATEGORY_COLORS } from '../types-v31';

type CategoryBadgeProps = {
	category: MatchCategory;
	variant: 'overlay' | 'inline';
};

export const CategoryBadge = ({ category, variant }: CategoryBadgeProps) => {
	const { t } = useTranslation();
	const color = CATEGORY_COLORS[category];
	const label = t(`features.idle-match-timer.ui.category-badge.${category}`);

	return (
		<View
			style={[
				styles.badge,
				variant === 'overlay' ? styles.overlay : styles.inline,
				variant === 'inline' && { backgroundColor: color.primary },
			]}
		>
			<Text style={styles.text}>{label}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 10,
		alignSelf: 'flex-start',
	},
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	inline: {
		// backgroundColor set dynamically
	},
	text: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: '700',
		fontFamily: 'Pretendard-Bold',
	},
});
