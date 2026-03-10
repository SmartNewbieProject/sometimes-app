import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

interface StepIndicatorProps {
	currentStep: 1 | 2 | 3;
}

const STEPS = ['steps.step1', 'steps.step2', 'steps.step3'] as const;

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			{STEPS.map((stepKey, index) => {
				const stepNumber = (index + 1) as 1 | 2 | 3;
				const isActive = stepNumber <= currentStep;
				const isLast = index === STEPS.length - 1;

				return (
					<View key={stepKey} style={styles.stepRow}>
						<View style={styles.stepItem}>
							<View style={[styles.circle, isActive && styles.circleActive]}>
								<Text
									size="xs"
									weight="bold"
									style={{ color: isActive ? '#FFFFFF' : semanticColors.text.disabled }}
								>
									{stepNumber}
								</Text>
							</View>
							<Text
								size="xs"
								weight={isActive ? 'semibold' : 'normal'}
								style={{
									color: isActive ? semanticColors.brand.primary : semanticColors.text.disabled,
								}}
							>
								{t(`apps.university-verification.${stepKey}`)}
							</Text>
						</View>
						{!isLast && <View style={[styles.line, isActive && styles.lineActive]} />}
					</View>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'center',
		paddingVertical: 16,
	},
	stepRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	stepItem: {
		alignItems: 'center',
		gap: 4,
	},
	circle: {
		width: 26,
		height: 26,
		borderRadius: 13,
		backgroundColor: semanticColors.surface.disabled,
		alignItems: 'center',
		justifyContent: 'center',
	},
	circleActive: {
		backgroundColor: semanticColors.brand.primary,
	},
	line: {
		width: 32,
		height: 2,
		backgroundColor: semanticColors.border.card,
		marginHorizontal: 8,
		marginBottom: 20,
	},
	lineActive: {
		backgroundColor: semanticColors.brand.primary,
	},
});
