import { Text } from '@/src/shared/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface QuestionCardProps {
	questionText: string;
}

export const OnboardingQuestionCard = ({ questionText }: QuestionCardProps) => {
	return (
		<View style={styles.card}>
			<View style={styles.content}>
				<Text size="18" weight="semibold" textColor="black" style={styles.text}>
					{questionText}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E4E2E2',
		shadowColor: '#7A4AE2',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	content: {
		padding: 24,
	},
	text: {
		textAlign: 'center',
		lineHeight: 28,
	},
});
