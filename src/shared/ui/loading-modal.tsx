import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './text';
import { semanticColors } from '../constants/semantic-colors';

interface LoadingModalProps {
	message?: string;
}

export function LoadingModal({ message }: LoadingModalProps) {
	const { t } = useTranslation();
	const displayMessage = message ?? t('common.processing');
	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={semanticColors.brand.primary} />
			<Text size="md" weight="medium" textColor="primary" style={styles.message}>
				{displayMessage}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: semanticColors.surface.background,
		width: 300,
		borderRadius: 16,
		padding: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	message: {
		marginTop: 16,
		textAlign: 'center',
	},
});
