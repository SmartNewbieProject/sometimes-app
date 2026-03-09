import colors from '@/src/shared/constants/colors';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MomentHeader = () => {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingTop: insets.top + 12 }]}>
			<Image
				source={require('@/assets/images/moment/moment-logo.webp')}
				style={styles.logo}
				contentFit="contain"
				defaultSource={require('@/assets/images/moment/moment-logo.webp')}
				accessibilityLabel="모먼트"
				accessibilityRole="image"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		alignItems: 'flex-start',
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingBottom: 16,
	},
	logo: {
		width: 120,
		height: 40,
	},
});
