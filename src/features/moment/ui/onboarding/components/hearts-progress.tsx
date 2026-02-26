import { Heart } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from 'react-native-reanimated';

interface HeartsProgressProps {
	currentStep: number;
	totalSteps: number;
}

const AnimatedHeart = ({ filled, animate }: { filled: boolean; animate: boolean }) => {
	const scale = useSharedValue(1);

	useEffect(() => {
		if (animate && filled) {
			scale.value = withSequence(
				withSpring(1.3, { damping: 6, stiffness: 300 }),
				withSpring(1, { damping: 8, stiffness: 200 }),
			);
		}
	}, [filled, animate, scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<Animated.View style={animatedStyle}>
			<Heart size={16} color={filled ? '#FF6B9D' : '#AEAEAE'} fill={filled ? '#FF6B9D' : 'none'} />
		</Animated.View>
	);
};

export const HeartsProgress = ({ currentStep, totalSteps }: HeartsProgressProps) => {
	return (
		<View style={styles.container}>
			{Array.from({ length: totalSteps }, (_, index) => (
				<AnimatedHeart
					key={`heart-${index}`}
					filled={index <= currentStep}
					animate={index === currentStep}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
});
