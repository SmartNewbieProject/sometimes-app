import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ChatProfileImageProps {
	imageUri: string;
	size: number;
}

function ChatProfileImage({ imageUri, size }: ChatProfileImageProps) {
	return <Image style={[styles.profileImage, { width: size, height: size }]} source={imageUri} />;
}

const styles = StyleSheet.create({
	profileImage: {
		borderRadius: 9999,
	},
});

export default ChatProfileImage;
