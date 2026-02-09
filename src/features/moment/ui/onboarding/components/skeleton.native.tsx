import React, { useEffect } from 'react';
import { type DimensionValue, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';

interface SkeletonProps {
	width: DimensionValue;
	height: number;
	borderRadius?: number;
	style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
	const opacity = useSharedValue(1);

	useEffect(() => {
		opacity.value = withRepeat(
			withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		);
	}, [opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	return (
		<Animated.View
			style={[
				styles.skeleton,
				{ width: width as number, height, borderRadius },
				animatedStyle,
				style,
			]}
		/>
	);
};

const styles = StyleSheet.create({
	skeleton: {
		backgroundColor: '#E8E0F0',
	},
});
