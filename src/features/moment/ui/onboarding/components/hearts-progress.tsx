import { Heart } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface HeartsProgressProps {
	currentStep: number;
	totalSteps: number;
}

export const HeartsProgress = ({ currentStep, totalSteps }: HeartsProgressProps) => {
	return (
		<View style={styles.container}>
			{Array.from({ length: totalSteps }, (_, index) => (
				<Heart
					key={`heart-${index}`}
					size={16}
					color={index <= currentStep ? '#FF6B9D' : '#AEAEAE'}
					fill={index <= currentStep ? '#FF6B9D' : 'none'}
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
