import { Text } from '@/src/shared/ui/text';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Header = () => {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingTop: insets.top + 12 }]}>
			<Text size="20" weight="bold" textColor="black">
				SOMETIME
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'flex-start',
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingBottom: 16,
	},
});
