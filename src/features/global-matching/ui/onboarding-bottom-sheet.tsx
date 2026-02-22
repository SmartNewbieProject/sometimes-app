import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useToast } from '@/src/shared/hooks/use-toast';
import { Text } from '@/src/shared/ui';
import { useEffect, useRef, useState } from 'react';
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
import { useCompleteOnboarding } from '../hooks/use-complete-onboarding';
import { useOnboardingPreferences } from '../hooks/use-onboarding-preferences';
import { useGlobalPreferenceOptions } from '../queries';
import { useGlobalMatchingStatus } from '../queries/use-global-matching-status';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;
const MAX_SHEET_WIDTH = 500;
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
	const { emitToast } = useToast();

	const [showSuccess, setShowSuccess] = useState(false);
	const [savedIds, setSavedIds] = useState<string[]>([]);
	const checkScale = useRef(new Animated.Value(0)).current;

	const completeOnboarding = useCompleteOnboarding();
	const { data: status } = useGlobalMatchingStatus(showSuccess ? 2000 : undefined);
	const profileTranslated = status?.profileTranslated ?? false;

	const {
		currentStep,
		currentCategory,
		totalSteps,
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

	useEffect(() => {
		if (showSuccess) {
			checkScale.setValue(0);
			Animated.spring(checkScale, {
				toValue: 1,
				tension: 50,
				friction: 6,
				useNativeDriver: true,
			}).start();
		}
	}, [showSuccess, checkScale]);

	const handleClose = () => {
		reset();
		setShowSuccess(false);
		completeOnboarding.reset();
		onClose();
	};

	const handleNext = async () => {
		if (isLastStep) {
			const ids = getPreferenceOptionIds();
			setSavedIds(ids);
			try {
				await completeOnboarding.mutateAsync(ids);
				setShowSuccess(true);
			} catch {
				emitToast(t('features.global-matching.onboarding_save_error'));
			}
		} else {
			nextStep();
		}
	};

	const handleStartMatching = () => {
		onComplete(savedIds);
		reset();
		setShowSuccess(false);
		completeOnboarding.reset();
	};

	const currentSelections = currentCategory ? (selections[currentCategory.optionId] ?? []) : [];

	const renderSuccessContent = () => (
		<View style={styles.successContainer}>
			<Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
				<Text size="32" style={styles.checkIcon}>
					{'\u2713'}
				</Text>
			</Animated.View>

			<Text size="20" weight="bold" style={styles.successTitle}>
				{t('features.global-matching.onboarding_complete_title')}
			</Text>

			<Text size="14" textColor="secondary" style={styles.successDesc}>
				{t('features.global-matching.onboarding_complete_desc')}
			</Text>

			<View style={styles.translationBadge}>
				{!profileTranslated && (
					<ActivityIndicator
						size="small"
						color={semanticColors.brand.primary}
						style={styles.translationSpinner}
					/>
				)}
				<Text
					size="13"
					weight="bold"
					style={profileTranslated ? styles.translatedText : styles.translatingText}
				>
					{profileTranslated
						? t('features.global-matching.onboarding_translated')
						: t('features.global-matching.onboarding_translating')}
				</Text>
			</View>
		</View>
	);

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

					{showSuccess ? (
						<>
							{/* Close button for success */}
							<View style={styles.successCloseRow}>
								<Pressable onPress={handleClose} hitSlop={8} style={styles.closeButton}>
									<Text size="20" textColor="disabled">
										{'\u2715'}
									</Text>
								</Pressable>
							</View>

							{renderSuccessContent()}

							{/* Start matching CTA */}
							<View style={styles.actionContainer}>
								<Pressable style={styles.actionButton} onPress={handleStartMatching}>
									<Text size="16" weight="bold" style={styles.actionText}>
										{t('features.global-matching.onboarding_start_matching')}
									</Text>
								</Pressable>
							</View>
						</>
					) : (
						<>
							{/* Header */}
							<View style={styles.header}>
								<View style={styles.headerLeft}>
									<Text size="18" weight="bold">
										{t('features.global-matching.onboarding_sheet_title')}
									</Text>
									<Text size="13" textColor="disabled" style={styles.stepLabel}>
										{t('features.global-matching.onboarding_step_label', {
											current: currentStep + 1,
											total: totalSteps,
										})}
									</Text>
								</View>
								<Pressable onPress={handleClose} hitSlop={8} style={styles.closeButton}>
									<Text size="20" textColor="disabled">
										{'\u2715'}
									</Text>
								</Pressable>
							</View>

							{/* Progress dots */}
							<View style={styles.progressContainer}>
								{(categories ?? []).map((cat, i) => (
									<View
										key={cat.optionId}
										style={[styles.progressDot, i <= currentStep && styles.progressDotActive]}
									/>
								))}
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
															style={isSelected ? styles.radioTextSelected : styles.radioText}
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
									style={[
										styles.actionButton,
										(!isCurrentStepValid || completeOnboarding.isPending) &&
											styles.actionButtonDisabled,
									]}
									onPress={handleNext}
									disabled={!isCurrentStepValid || completeOnboarding.isPending}
								>
									{completeOnboarding.isPending ? (
										<ActivityIndicator color="#FFFFFF" />
									) : (
										<Text size="16" weight="bold" style={styles.actionText}>
											{isLastStep
												? t('features.global-matching.onboarding_complete')
												: t('features.global-matching.onboarding_next')}
										</Text>
									)}
								</Pressable>
							</View>
						</>
					)}
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
	},
	sheet: {
		width: '100%',
		maxWidth: MAX_SHEET_WIDTH,
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: -4 },
				shadowOpacity: 0.08,
				shadowRadius: 12,
			},
			android: {
				elevation: 16,
			},
		}),
	},
	handleContainer: {
		alignItems: 'center',
		paddingTop: 12,
		paddingBottom: 4,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: '#E0E0E0',
		borderRadius: 2,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingHorizontal: 24,
		paddingTop: 8,
		paddingBottom: 16,
	},
	headerLeft: {
		flex: 1,
	},
	stepLabel: {
		marginTop: 4,
	},
	closeButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	progressContainer: {
		flexDirection: 'row',
		gap: 6,
		paddingHorizontal: 24,
		marginBottom: 8,
	},
	progressDot: {
		flex: 1,
		height: 4,
		borderRadius: 2,
		backgroundColor: '#F0F0F0',
	},
	progressDotActive: {
		backgroundColor: semanticColors.brand.primary,
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
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 10,
	},
	categoryTitle: {
		marginBottom: 6,
		color: '#1A1A1A',
	},
	maxSelectHint: {
		marginBottom: 12,
	},
	chipGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginTop: 16,
	},
	chip: {
		paddingHorizontal: 18,
		paddingVertical: 11,
		borderRadius: 22,
		backgroundColor: '#F5F5F5',
		borderWidth: 1.5,
		borderColor: '#F5F5F5',
	},
	chipSelected: {
		backgroundColor: 'rgba(122, 74, 226, 0.08)',
		borderColor: semanticColors.brand.primary,
	},
	chipText: {
		color: '#1A1A1A',
	},
	chipTextSelected: {
		color: semanticColors.brand.primary,
	},
	radioList: {
		gap: 10,
		marginTop: 16,
	},
	radioItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 15,
		paddingHorizontal: 18,
		borderRadius: 16,
		backgroundColor: '#F8F8F8',
		borderWidth: 1.5,
		borderColor: '#F8F8F8',
	},
	radioItemSelected: {
		backgroundColor: 'rgba(122, 74, 226, 0.06)',
		borderColor: semanticColors.brand.primary,
	},
	radioCircle: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
		borderColor: '#D0D0D0',
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
	radioText: {
		color: '#1A1A1A',
	},
	actionContainer: {
		paddingHorizontal: 24,
		paddingTop: 12,
	},
	actionButton: {
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
	},
	actionButtonDisabled: {
		opacity: 0.35,
	},
	actionText: {
		color: '#FFFFFF',
	},
	successCloseRow: {
		alignItems: 'flex-end',
		paddingHorizontal: 24,
		paddingTop: 4,
	},
	successContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
	},
	checkCircle: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: 'rgba(122, 74, 226, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	checkIcon: {
		color: semanticColors.brand.primary,
	},
	successTitle: {
		color: '#1A1A1A',
		marginBottom: 8,
		textAlign: 'center',
	},
	successDesc: {
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 20,
	},
	translationBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F5F3FF',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
		gap: 6,
	},
	translationSpinner: {
		marginRight: 2,
	},
	translatingText: {
		color: '#9B8ABB',
	},
	translatedText: {
		color: semanticColors.brand.primary,
	},
});
