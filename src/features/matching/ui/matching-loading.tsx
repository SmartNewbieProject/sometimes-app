import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '@/src/shared/constants/colors';

interface MatchingLoadingProps {
	message: string;
	description?: string;
}

export const MatchingLoading: React.FC<MatchingLoadingProps> = ({
	message,
	description = '잠시만 기다려주세요...',
}) => {
	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={colors.brand.primary} />
			<View style={styles.textContainer}>
				<Text style={styles.message}>{message}</Text>
				<Text style={styles.description}>{description}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.surface.background,
		gap: 24,
	},
	textContainer: {
		alignItems: 'center',
		gap: 8,
	},
	message: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.text.primary,
		textAlign: 'center',
	},
	description: {
		fontSize: 14,
		color: colors.text.muted,
		textAlign: 'center',
	},
});
