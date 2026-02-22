import { Text } from '@/src/shared/ui/text';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface LogoProps {
	title?: string;
	showLogo?: boolean;
	logoSize?: number;
}

export function Logo({ title, showLogo, logoSize }: LogoProps) {
	return (
		<View style={styles.container}>
			<Text size="20" weight="bold" textColor="black">
				{title || 'SOMETIME'}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'center',
	},
});
