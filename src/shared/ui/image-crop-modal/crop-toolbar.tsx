import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../text';
import type { CropToolbarProps } from './types';

export function CropToolbar({ onRotate }: CropToolbarProps) {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
			<Pressable onPress={onRotate} style={styles.button}>
				<Text size="xl" style={styles.icon}>
					↻
				</Text>
				<Text size="sm" weight="medium" style={styles.label}>
					{t('common.회전')}
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 16,
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
		paddingHorizontal: 24,
	},
	icon: {
		color: '#FFFFFF',
		marginBottom: 4,
	},
	label: {
		color: '#FFFFFF',
	},
});
