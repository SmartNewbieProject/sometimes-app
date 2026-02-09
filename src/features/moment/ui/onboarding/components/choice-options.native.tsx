import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	FadeIn,
} from 'react-native-reanimated';
import type { OnboardingQuestionOption } from '../../../types';

interface ChoiceOptionsProps {
	options: OnboardingQuestionOption[];
	selectedOptionId: string | null;
	onSelect: (optionId: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ChoiceItem = ({
	option,
	isSelected,
	onPress,
}: {
	option: OnboardingQuestionOption;
	isSelected: boolean;
	onPress: () => void;
}) => {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = useCallback(() => {
		scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
	}, [scale]);

	const handlePressOut = useCallback(() => {
		scale.value = withSpring(1, { damping: 15, stiffness: 300 });
	}, [scale]);

	const handlePress = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	}, [onPress]);

	return (
		<AnimatedPressable
			style={[styles.option, isSelected && styles.optionSelected, animatedStyle]}
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
		>
			<View style={[styles.radio, isSelected && styles.radioSelected]}>
				{isSelected && <Animated.View entering={FadeIn.duration(200)} style={styles.radioInner} />}
			</View>
			<Text
				size="15"
				weight={isSelected ? 'semibold' : 'normal'}
				textColor={isSelected ? 'purple' : 'black'}
				style={styles.optionText}
			>
				{option.text}
			</Text>
		</AnimatedPressable>
	);
};

export const ChoiceOptions = ({ options, selectedOptionId, onSelect }: ChoiceOptionsProps) => {
	return (
		<View style={styles.container}>
			{options.map((option) => (
				<ChoiceItem
					key={option.id}
					option={option}
					isSelected={selectedOptionId === option.id}
					onPress={() => onSelect(option.id)}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 12,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 16,
		borderWidth: 1.5,
		borderColor: '#E5E5E5',
	},
	optionSelected: {
		borderColor: colors.primaryPurple,
		backgroundColor: '#F8F5FF',
	},
	radio: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
		borderColor: '#CCCCCC',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 14,
	},
	radioSelected: {
		borderColor: colors.primaryPurple,
	},
	radioInner: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: colors.primaryPurple,
	},
	optionText: {
		flex: 1,
		lineHeight: 22,
	},
});
