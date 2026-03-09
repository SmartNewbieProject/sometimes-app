import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/src/shared/constants/colors';
import { Button, Text } from '@/src/shared/ui';
import { Header } from '@/src/shared/ui/header';

import { useMomentOnboarding } from '../../hooks/use-moment-onboarding';
import { useOnboardingQuestionsQuery } from '../../queries/onboarding';
import {
	AnimatedProgressBar,
	AnimatedTransition,
	ChoiceOptions,
	HeartsProgress,
	OnboardingQuestionCard,
	OnboardingQuestionsSkeleton,
	OnboardingTextInput,
} from './components';
import { MOMENT_ONBOARDING_KEYS } from './keys';

type AnswerMode = 'text' | 'choice';

export const OnboardingQuestions = () => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const prevStepRef = useRef(0);
	const [answerMode, setAnswerMode] = useState<AnswerMode>('text');

	const { data: questionsData, isLoading: isLoadingQuestions } = useOnboardingQuestionsQuery();

	const {
		currentStep,
		totalSteps,
		answers,
		setQuestions,
		setAnswer,
		nextStep,
		prevStep: goPrevStep,
		getCurrentQuestion,
		getProgress,
		isLastStep,
	} = useMomentOnboarding();

	useEffect(() => {
		if (questionsData?.questions) {
			setQuestions(questionsData.questions);
		}
	}, [questionsData]);

	const currentQuestion = getCurrentQuestion();
	const progress = getProgress();
	const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : null;

	const direction = currentStep >= prevStepRef.current ? 'forward' : 'backward';

	const hasOptions = currentQuestion?.options && currentQuestion.options.length > 0;

	// 배경 색상 점진적 변화
	const BACKGROUND_COLORS = ['#FFFFFF', '#FEFCFF', '#FDFAFF', '#FCF8FF', '#FBF6FF'];
	const bgColorIndex = Math.min(currentStep, BACKGROUND_COLORS.length - 1);
	const bgR = useSharedValue(255);
	const bgG = useSharedValue(255);
	const bgB = useSharedValue(255);

	useEffect(() => {
		const hex = BACKGROUND_COLORS[bgColorIndex];
		const r = Number.parseInt(hex.slice(1, 3), 16);
		const g = Number.parseInt(hex.slice(3, 5), 16);
		const b = Number.parseInt(hex.slice(5, 7), 16);
		bgR.value = withTiming(r, { duration: 200 });
		bgG.value = withTiming(g, { duration: 200 });
		bgB.value = withTiming(b, { duration: 200 });
	}, [bgColorIndex, bgR, bgG, bgB]);

	const animatedBgStyle = useAnimatedStyle(() => ({
		backgroundColor: `rgb(${Math.round(bgR.value)}, ${Math.round(bgG.value)}, ${Math.round(bgB.value)})`,
	}));

	useEffect(() => {
		prevStepRef.current = currentStep;
	}, [currentStep]);

	const handleOptionSelect = (optionId: string) => {
		if (!currentQuestion) return;
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		const optionText = currentQuestion.options?.find((o) => o.id === optionId)?.text ?? '';
		setAnswer(currentQuestion.id, {
			...currentAnswer,
			questionId: currentQuestion.id,
			answer: optionText,
			optionId,
		});
	};

	const handleTextChange = (text: string) => {
		if (!currentQuestion) return;
		setAnswer(currentQuestion.id, {
			...currentAnswer,
			questionId: currentQuestion.id,
			answer: text,
		});
	};

	// 현재 활성 모드 기준 진행 가능 여부
	const canProceedWithMode = () => {
		if (!currentAnswer) return false;
		if (answerMode === 'choice' && hasOptions) {
			return !!currentAnswer.optionId;
		}
		return !!currentAnswer.answer?.trim();
	};

	const handleNext = () => {
		if (!canProceedWithMode()) return;

		if (isLastStep()) {
			router.replace('/moment/onboarding/loading');
		} else {
			setAnswerMode('text');
			nextStep();
		}
	};

	const handleBack = () => {
		if (currentStep === 0) {
			router.back();
		} else {
			setAnswerMode('text');
			goPrevStep();
		}
	};

	if (isLoadingQuestions || !currentQuestion) {
		return <OnboardingQuestionsSkeleton />;
	}

	return (
		<Animated.View
			style={[styles.container, { paddingTop: insets.top }, animatedBgStyle]}
			onTouchStart={Keyboard.dismiss}
		>
			<Header.Container>
				<Header.LeftContent>
					<Header.LeftButton visible onPress={handleBack} />
				</Header.LeftContent>
				<Header.Logo title={t(MOMENT_ONBOARDING_KEYS.questions.headerTitle)} showLogo={false} />
				<Header.RightContent />
			</Header.Container>

			<View style={styles.progressContainer}>
				<AnimatedProgressBar progress={progress} height={8} />
			</View>

			<AnimatedTransition transitionKey={currentStep} direction={direction}>
				<View style={styles.content}>
					{/* 하트 진행표시 - 우측 정렬 */}
					<View style={styles.heartsRow}>
						<HeartsProgress currentStep={currentStep} totalSteps={totalSteps} />
					</View>

					<View style={styles.questionContainer}>
						<OnboardingQuestionCard questionText={currentQuestion.text} />
					</View>

					{/* 탭 UI - choice 질문(options 있을 때)만 표시 */}
					{hasOptions && (
						<View style={styles.tabContainer}>
							<Pressable
								style={[styles.tab, answerMode === 'text' && styles.tabActive]}
								onPress={() => setAnswerMode('text')}
								accessibilityRole="tab"
								accessibilityState={{ selected: answerMode === 'text' }}
								accessibilityLabel={t(MOMENT_ONBOARDING_KEYS.questions.tabText)}
							>
								<Text
									size="14"
									weight={answerMode === 'text' ? 'semibold' : 'medium'}
									style={{ color: answerMode === 'text' ? colors.primaryPurple : '#767676' }}
								>
									{t(MOMENT_ONBOARDING_KEYS.questions.tabText)}
								</Text>
							</Pressable>
							<Pressable
								style={[styles.tab, answerMode === 'choice' && styles.tabActive]}
								onPress={() => setAnswerMode('choice')}
								accessibilityRole="tab"
								accessibilityState={{ selected: answerMode === 'choice' }}
								accessibilityLabel={t(MOMENT_ONBOARDING_KEYS.questions.tabChoice)}
							>
								<Text
									size="14"
									weight={answerMode === 'choice' ? 'semibold' : 'medium'}
									style={{ color: answerMode === 'choice' ? colors.primaryPurple : '#767676' }}
								>
									{t(MOMENT_ONBOARDING_KEYS.questions.tabChoice)}
								</Text>
							</Pressable>
						</View>
					)}

					{/* 답변 영역 */}
					<View style={styles.answerContainer}>
						{answerMode === 'choice' && hasOptions ? (
							<ChoiceOptions
								options={currentQuestion.options ?? []}
								selectedOptionId={currentAnswer?.optionId ?? null}
								onSelect={handleOptionSelect}
							/>
						) : (
							<OnboardingTextInput
								value={currentAnswer?.answer ?? ''}
								onChange={handleTextChange}
								placeholder={
									currentQuestion.placeholder ?? t(MOMENT_ONBOARDING_KEYS.questions.placeholder)
								}
								maxLength={currentQuestion.maxLength ?? 500}
							/>
						)}
					</View>
				</View>
			</AnimatedTransition>

			<View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}>
				<Button
					variant="primary"
					size="lg"
					onPress={handleNext}
					disabled={!canProceedWithMode()}
					style={styles.nextButton}
				>
					{isLastStep()
						? t(MOMENT_ONBOARDING_KEYS.questions.submitButton)
						: t(MOMENT_ONBOARDING_KEYS.questions.nextButton)}
				</Button>
			</View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	progressContainer: {
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},
	heartsRow: {
		alignItems: 'flex-end',
		marginBottom: 8,
	},
	questionContainer: {
		marginBottom: 24,
	},
	tabContainer: {
		flexDirection: 'row',
		backgroundColor: '#F3F3F3',
		borderRadius: 10,
		padding: 3,
		marginBottom: 16,
	},
	tab: {
		flex: 1,
		paddingVertical: 8,
		alignItems: 'center',
		borderRadius: 8,
	},
	tabActive: {
		backgroundColor: '#FFFFFF',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 2,
		elevation: 1,
	},
	answerContainer: {
		flex: 1,
	},
	buttonContainer: {
		paddingHorizontal: 24,
		paddingTop: 16,
	},
	nextButton: {
		width: '100%',
	},
});
