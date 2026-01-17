import { Image } from 'expo-image';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { CropOverlay } from './crop-overlay';
import type { CropCanvasProps, ImageSize } from './types';
import { useCropGesture } from './use-crop-gesture';

interface CropCanvasWithGestureProps extends CropCanvasProps {
	containerSize: ImageSize;
}

export function CropCanvas({
	imageUri,
	cropSize,
	transform,
	imageSize,
	containerSize,
}: CropCanvasWithGestureProps) {
	const { nativeGesture, webHandlers } = useCropGesture({
		transform,
		imageSize,
		cropSize,
	});

	const imageAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: transform.translateX.value },
				{ translateY: transform.translateY.value },
				{ scale: transform.scale.value },
				{ rotate: `${transform.rotation.value}deg` },
			],
		};
	});

	const renderImage = () => (
		<Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
			<Image
				source={{ uri: imageUri }}
				style={{
					width: imageSize.width,
					height: imageSize.height,
				}}
				contentFit="contain"
			/>
		</Animated.View>
	);

	if (Platform.OS === 'web') {
		return (
			<View style={styles.container}>
				<View
					style={styles.gestureArea}
					onPointerDown={webHandlers.onPointerDown}
					onPointerMove={webHandlers.onPointerMove}
					onPointerUp={webHandlers.onPointerUp}
					{...({
						onMouseDown: webHandlers.onPointerDown,
						onMouseMove: webHandlers.onPointerMove,
						onMouseUp: webHandlers.onPointerUp,
						onWheel: webHandlers.onWheel,
					} as any)}
				>
					{renderImage()}
				</View>
				<CropOverlay cropSize={cropSize} containerSize={containerSize} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<GestureDetector gesture={nativeGesture}>
				<View style={styles.gestureArea}>{renderImage()}</View>
			</GestureDetector>
			<CropOverlay cropSize={cropSize} containerSize={containerSize} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		overflow: 'hidden',
	},
	gestureArea: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		...Platform.select({
			web: {
				touchAction: 'none',
				userSelect: 'none',
				cursor: 'move',
			} as any,
			default: {},
		}),
	},
	imageContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});
