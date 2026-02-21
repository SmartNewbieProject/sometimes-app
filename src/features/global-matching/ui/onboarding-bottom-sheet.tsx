import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	Easing,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingPreferences } from '../hooks/use-onboarding-preferences';
import { useGlobalPreferenceOptions } from '../queries';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;
const ANIMATION_DURATION = 300;

type Props = {
	visible: boolean;
	onClose: () => void;
	onComplete: (preferenceOptionIds: string[]) => void;
};

export const OnboardingBottomSheet = ({ visible, onClose, onComplete }: Props) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
	const backdropOpacity = useRef(new Animated.Value(0)).current;
	const { data: categories, isLoading } = useGlobalPreferenceOptions();

	const {
		currentStep,
		currentCategory,
		totalSteps,
		progress,
		isLastStep,
		selections,
		select,
		isCurrentStepValid,
		nextStep,
		getPreferenceOptionIds,
		reset,
	} = useOnboardingPreferences(categories ?? []);

	useEffect(() => {
		if (visible) {
			Animated.parallel([
				Animated.timing(translateY, {
					toValue: 0,
					duration: ANIMATION_DURATION,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(backdropOpacity, {
					toValue: 1,
					duration: ANIMATION_DURATION,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(translateY, {
					toValue: SHEET_HEIGHT,
					duration: ANIMATION_DURATION,
					easing: Easing.in(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(backdropOpacity, {
					toValue: 0,
					duration: ANIMATION_DURATION,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible, translateY, backdropOpacity]);

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleNext = () => {
		if (isLastStep) {
			onComplete(getPreferenceOptionIds());
			reset();
		} else {
			nextStep();
		}
	};

	const currentSelections = currentCategory ? (selections[currentCategory.optionId] ?? []) : [];

	return (
		<Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
			<View style={styles.overlay}>
				<Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
					<Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
				</Animated.View>

				<Animated.View
					style={[
						styles.sheet,
						{
							height: SHEET_HEIGHT,
							paddingBottom: insets.bottom || 20,
							transform: [{ translateY }],
						},
					]}
				>
					{/* Handle */}
					<View style={styles.handleContainer}>
						<View style={styles.handle} />
					</View>

					{/* Header */}
					<View style={styles.header}>
						<Text size="18" weight="bold">
							{t('features.global-matching.onboarding_sheet_title')}
						</Text>
						<Text size="13" textColor="disabled">
							{t('features.global-matching.onboarding_step_label', {
								current: currentStep + 1,
								total: totalSteps,
							})}
						</Text>
					</View>

					{/* Progress bar */}
					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
					</View>

					{/* Content */}
					{isLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator color={semanticColors.brand.primary} />
						</View>
					) : currentCategory ? (
						<ScrollView
							style={styles.scrollContent}
							contentContainerStyle={styles.scrollContainer}
							showsVerticalScrollIndicator={false}
						>
							<Text size="16" weight="bold" style={styles.categoryTitle}>
								{currentCategory.optionDisplayName}
							</Text>

							{currentCategory.multiple && currentCategory.maximumChoiceCount > 1 && (
								<Text size="12" textColor="disabled" style={styles.maxSelectHint}>
									{t('features.global-matching.onboarding_max_select', {
										count: currentCategory.maximumChoiceCount,
									})}
								</Text>
							)}

							{currentCategory.multiple ? (
								<View style={styles.chipGrid}>
									{currentCategory.options?.map((option) => {
										const isSelected = currentSelections.includes(option.id);
										return (
											<Pressable
												key={option.id}
												style={[styles.chip, isSelected && styles.chipSelected]}
												onPress={() => select(currentCategory.optionId, option.id)}
											>
												<Text
													size="14"
													weight={isSelected ? 'bold' : 'normal'}
													style={isSelected ? styles.chipTextSelected : styles.chipText}
												>
													{option.displayName}
												</Text>
											</Pressable>
										);
									})}
								</View>
							) : (
								<View style={styles.radioList}>
									{currentCategory.options?.map((option) => {
										const isSelected = currentSelections.includes(option.id);
										return (
											<Pressable
												key={option.id}
												style={[styles.radioItem, isSelected && styles.radioItemSelected]}
												onPress={() => select(currentCategory.optionId, option.id)}
											>
												<View
													style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
												>
													{isSelected && <View style={styles.radioInner} />}
												</View>
												<Text
													size="15"
													weight={isSelected ? 'bold' : 'normal'}
													style={isSelected ? styles.radioTextSelected : undefined}
												>
													{option.displayName}
												</Text>
											</Pressable>
										);
									})}
								</View>
							)}
						</ScrollView>
					) : null}

					{/* Action button */}
					<View style={styles.actionContainer}>
						<Pressable
							style={[styles.actionButton, !isCurrentStepValid && styles.actionButtonDisabled]}
							onPress={handleNext}
							disabled={!isCurrentStepValid}
						>
							<Text size="16" weight="bold" style={styles.actionText}>
								{isLastStep
									? t('features.global-matching.onboarding_complete')
									: t('features.global-matching.onboarding_next')}
							</Text>
						</Pressable>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	sheet: {
		backgroundColor: semanticColors.surface.background,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: -3 },
				shadowOpacity: 0.1,
				shadowRadius: 5,
			},
			android: {
				elevation: 16,
			},
		}),
	},
	handleContainer: {
		alignItems: 'center',
		paddingVertical: 12,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: semanticColors.border.default,
		borderRadius: 2,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	progressBar: {
		height: 3,
		backgroundColor: semanticColors.border.light,
		marginHorizontal: 20,
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 2,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scrollContent: {
		flex: 1,
	},
	scrollContainer: {
		padding: 20,
		paddingBottom: 10,
	},
	categoryTitle: {
		marginBottom: 6,
	},
	maxSelectHint: {
		marginBottom: 16,
	},
	chipGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginTop: 16,
	},
	chip: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 20,
		backgroundColor: semanticColors.surface.secondary,
		borderWidth: 1.5,
		borderColor: 'transparent',
	},
	chipSelected: {
		backgroundColor: 'rgba(122, 74, 226, 0.1)',
		borderColor: semanticColors.brand.primary,
	},
	chipText: {
		color: semanticColors.text.secondary,
	},
	chipTextSelected: {
		color: semanticColors.brand.primary,
	},
	radioList: {
		gap: 8,
		marginTop: 16,
	},
	radioItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 14,
		backgroundColor: semanticColors.surface.secondary,
		borderWidth: 1.5,
		borderColor: 'transparent',
	},
	radioItemSelected: {
		backgroundColor: 'rgba(122, 74, 226, 0.1)',
		borderColor: semanticColors.brand.primary,
	},
	radioCircle: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
		borderColor: semanticColors.border.default,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioCircleSelected: {
		borderColor: semanticColors.brand.primary,
	},
	radioInner: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: semanticColors.brand.primary,
	},
	radioTextSelected: {
		color: semanticColors.brand.primary,
	},
	actionContainer: {
		paddingHorizontal: 20,
		paddingTop: 12,
	},
	actionButton: {
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 14,
		paddingVertical: 16,
		alignItems: 'center',
	},
	actionButtonDisabled: {
		opacity: 0.4,
	},
	actionText: {
		color: '#FFFFFF',
	},
});
