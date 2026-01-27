import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

function SomemateBanner() {
	const handlePress = () => {
		router.push('/chat/somemate');
	};

	return (
		<Pressable onPress={handlePress} style={styles.container}>
			<Image
				source={require('@assets/images/somemate_banner.webp')}
				style={styles.image}
				contentFit="contain"
			/>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		maxWidth: 470,
		marginBottom: 8,
		alignSelf: 'center',
	},
	image: {
		width: '100%',
		height: 120,
	},
});

export default SomemateBanner;
