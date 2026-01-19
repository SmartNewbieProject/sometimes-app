import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../text';
import type { CropHeaderProps } from './types';

export function CropHeader({ onCancel, onComplete, isProcessing }: CropHeaderProps) {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	return (
		<View style={[styles.container, { paddingTop: insets.top + 12 }]}>
			<Pressable onPress={onCancel} style={styles.button} disabled={isProcessing}>
				<Text size="md" weight="medium" style={styles.buttonText}>
					{t('common.cancel')}
				</Text>
			</Pressable>

			<Text size="lg" weight="semibold" style={styles.title}>
				{t('common.사진_편집')}
			</Text>

			<Pressable onPress={onComplete} style={styles.button} disabled={isProcessing}>
				{isProcessing ? (
					<ActivityIndicator size="small" color="#FFFFFF" />
				) : (
					<Text size="md" weight="semibold" style={styles.completeText}>
						{t('common.완료')}
					</Text>
				)}
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	button: {
		minWidth: 60,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
		paddingHorizontal: 4,
	},
	buttonText: {
		color: '#FFFFFF',
	},
	title: {
		color: '#FFFFFF',
	},
	completeText: {
		color: '#7A4AE2',
	},
});
