import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { OnboardingQuestionOption } from '../../../types';

interface ChoiceOptionsProps {
	options: OnboardingQuestionOption[];
	selectedOptionId: string | null;
	onSelect: (optionId: string) => void;
}

const ChoiceItem = ({
	option,
	isSelected,
	onPress,
}: {
	option: OnboardingQuestionOption;
	isSelected: boolean;
	onPress: () => void;
}) => {
	return (
		<Pressable
			// @ts-ignore - web-only style
			style={({ pressed }: { pressed: boolean }) => [
				styles.option,
				isSelected && styles.optionSelected,
				webStyles.transition,
				pressed && webStyles.pressed,
			]}
			onPress={onPress}
		>
			<View style={[styles.radio, isSelected && styles.radioSelected]}>
				{isSelected && (
					<View
						style={[
							styles.radioInner,
							// @ts-ignore - web-only CSS transition
							webStyles.radioTransition,
						]}
					/>
				)}
			</View>
			<Text
				size="15"
				weight={isSelected ? 'semibold' : 'normal'}
				textColor={isSelected ? 'purple' : 'black'}
				style={styles.optionText}
			>
				{option.text}
			</Text>
		</Pressable>
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

const webStyles = {
	transition: {
		// @ts-ignore - web-only
		transition: 'transform 0.15s ease, border-color 0.2s ease, background-color 0.2s ease',
		cursor: 'pointer',
	},
	pressed: {
		transform: [{ scale: 0.97 }],
	},
	radioTransition: {
		// @ts-ignore - web-only
		transition: 'opacity 0.2s ease',
	},
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
