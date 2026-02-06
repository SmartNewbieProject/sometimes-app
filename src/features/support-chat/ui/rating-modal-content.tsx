import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

interface RatingModalContentProps {
	onSubmit: (rating: number) => void;
	onSkip: () => void;
}

function RatingModalContent({ onSubmit, onSkip }: RatingModalContentProps) {
	const { t } = useTranslation();
	const [selectedRating, setSelectedRating] = useState<number>(0);

	const handleStarPress = (rating: number) => {
		setSelectedRating(rating);
	};

	const handleSubmit = () => {
		if (selectedRating > 0) {
			onSubmit(selectedRating);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('features.support-chat.rating.title')}</Text>
			<Text style={styles.description}>{t('features.support-chat.rating.description')}</Text>

			<View style={styles.starsContainer}>
				{[1, 2, 3, 4, 5].map((star) => (
					<Pressable
						key={star}
						onPress={() => handleStarPress(star)}
						style={styles.starButton}
						hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
					>
						<Text style={selectedRating >= star ? [styles.star, styles.starSelected] : styles.star}>
							{selectedRating >= star ? '\u2605' : '\u2606'}
						</Text>
					</Pressable>
				))}
			</View>

			<View style={styles.buttonContainer}>
				<Pressable onPress={onSkip} style={styles.skipButton}>
					<Text style={styles.skipButtonText}>{t('features.support-chat.rating.skip')}</Text>
				</Pressable>
				<Pressable
					onPress={handleSubmit}
					style={
						selectedRating === 0
							? [styles.submitButton, styles.submitButtonDisabled]
							: styles.submitButton
					}
					disabled={selectedRating === 0}
				>
					<Text
						style={
							selectedRating === 0
								? [styles.submitButtonText, styles.submitButtonTextDisabled]
								: styles.submitButtonText
						}
					>
						{t('features.support-chat.rating.submit')}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
		color: semanticColors.text.primary,
		marginBottom: 8,
		fontFamily: 'Pretendard-SemiBold',
	},
	description: {
		fontSize: 14,
		color: semanticColors.text.muted,
		marginBottom: 20,
		fontFamily: 'Pretendard-Regular',
	},
	starsContainer: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 24,
	},
	starButton: {
		padding: 4,
	},
	star: {
		fontSize: 32,
		color: semanticColors.border.default,
	},
	starSelected: {
		color: '#FFD700',
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 12,
		width: '100%',
	},
	skipButton: {
		flex: 1,
		paddingVertical: 14,
		alignItems: 'center',
		borderRadius: 12,
		backgroundColor: semanticColors.surface.tertiary,
	},
	skipButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-SemiBold',
	},
	submitButton: {
		flex: 1,
		paddingVertical: 14,
		alignItems: 'center',
		borderRadius: 12,
		backgroundColor: semanticColors.brand.primary,
	},
	submitButtonDisabled: {
		backgroundColor: semanticColors.surface.tertiary,
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: semanticColors.text.inverse,
		fontFamily: 'Pretendard-SemiBold',
	},
	submitButtonTextDisabled: {
		color: semanticColors.text.muted,
	},
});

export default RatingModalContent;
