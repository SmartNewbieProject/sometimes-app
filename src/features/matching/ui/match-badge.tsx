import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/src/shared/constants/colors';
import type { BadgeData } from '../types';

interface MatchBadgeProps {
	badge: BadgeData;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({ badge }) => {
	const { icon, text, distance } = badge;

	return (
		<View style={styles.container}>
			<Text style={styles.icon}>{icon}</Text>
			<Text style={styles.text}>
				{text}
				{distance && ` (${distance})`}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 16,
		right: 16,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
		zIndex: 10,
	},
	icon: {
		fontSize: 14,
	},
	text: {
		color: colors.white,
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: -0.02,
	},
});
