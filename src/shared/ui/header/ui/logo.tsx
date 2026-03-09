import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface LogoProps {
	title?: string;
	showLogo?: boolean;
	logoSize?: number;
}

export function Logo({ title, showLogo = true, logoSize = 128 }: LogoProps) {
	if (!showLogo) {
		return null;
	}
	return (
		<View style={styles.container}>
			<Image
				source={require('@assets/images/sometimes.png')}
				style={{ width: logoSize, height: 18 }}
				resizeMode="contain"
			/>
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
