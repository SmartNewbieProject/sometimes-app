import colors from '@/src/shared/constants/colors';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from 'react-native-reanimated';

interface AnimatedProgressBarProps {
	progress: number;
	width?: number;
	height?: number;
}

export const AnimatedProgressBar = ({ progress, width, height = 12 }: AnimatedProgressBarProps) => {
	const animatedProgress = useSharedValue(0);

	useEffect(() => {
		animatedProgress.value = withTiming(progress, {
			duration: 400,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
	}, [progress, animatedProgress]);

	const barStyle = useAnimatedStyle(() => ({
		width: `${Math.min(animatedProgress.value * 100, 100)}%`,
	}));

	return (
		<View style={[styles.track, { height, borderRadius: height / 2 }, width != null && { width }]}>
			<Animated.View style={[styles.fill, { height, borderRadius: height / 2 }, barStyle]} />
		</View>
	);
};

const styles = StyleSheet.create({
	track: {
		backgroundColor: '#F3EDFF',
		overflow: 'hidden',
	},
	fill: {
		backgroundColor: colors.primaryPurple,
	},
});
