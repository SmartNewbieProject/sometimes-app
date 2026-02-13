import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useTestAnalytics } from '@/src/features/ideal-type-test/hooks/use-test-analytics';
import { useTestProgress } from '@/src/features/ideal-type-test/hooks/use-test-progress';
import { useTestSession } from '@/src/features/ideal-type-test/hooks/use-test-session';
import { useSubmitAnswer } from '@/src/features/ideal-type-test/queries';
import type { Answer, LanguageCode, QuestionOption } from '@/src/features/ideal-type-test/types';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useToast } from '@/src/shared/hooks/use-toast';
import { ProgressBar } from '@/src/shared/ui/progress-bar';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	BackHandler,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import Animated, {
	FadeIn,
	SlideInRight,
	SlideOutLeft,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function OptionButton({
	option,
	index,
	isSelected,
	isDisabled,
	onPress,
}: {
	option: QuestionOption;
	index: number;
	isSelected: boolean;
	isDisabled: boolean;
	onPress: () => void;
}) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = () => {
		scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 8, stiffness: 300 });
	};

	const handlePress = () => {
		if (Platform.OS !== 'web') {
			try {
				const Haptics = require('expo-haptics');
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			} catch {}
		}
		onPress();
	};

	return (
		<Animated.View entering={FadeIn.delay(index * 100).duration(300)} style={animatedStyle}>
			<Pressable
				style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
				onPress={handlePress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				disabled={isDisabled}
			>
				<Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
					{option.text}
				</Text>
				{isDisabled && isSelected && (
					<ActivityIndicator size="small" color={semanticColors.surface.background} />
				)}
			</Pressable>
		</Animated.View>
	);
}

export interface TestQuestionsScreenProps {
	source: 'auth' | 'moment';
	onComplete: () => void;
	onRedirectToStart: () => void;
	onAbandon: () => void;
}

export function TestQuestionsScreen({
	source,
	onComplete,
	onRedirectToStart,
	onAbandon,
}: TestQuestionsScreenProps) {
	const { t, i18n } = useTranslation();
	const insets = useSafeAreaInsets();
	const { isAuthorized } = useAuth();
	const { trackQuestionViewed, trackQuestionAnswered, trackTestCompleted, trackAbandoned } =
		useTestAnalytics();
	const { mutate: submitAnswer, isPending } = useSubmitAnswer();
	const {
		sessionId,
		expiresAt,
		questions,
		currentQuestionIndex,
		answers,
		addAnswer,
		nextQuestion,
		setResult,
	} = useTestProgress();

	const progress = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;
	const { saveSession, clearSession } = useTestSession();
	const { emitToast } = useToast();
	const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const hasTrackedCurrentQuestion = useRef(false);

	const currentLang = (i18n.language?.startsWith('ja') ? 'ja' : 'ko') as LanguageCode;
	const currentQuestion = questions[currentQuestionIndex];
	const userType = isAuthorized ? 'logged_in' : 'guest';

	// Redirect if no session
	useEffect(() => {
		if (!sessionId || questions.length === 0) {
			onRedirectToStart();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, questions]);

	// Track question view
	useEffect(() => {
		if (currentQuestion && !hasTrackedCurrentQuestion.current) {
			trackQuestionViewed({
				source: 'mobile',
				session_id: sessionId || '',
				question_number: currentQuestionIndex + 1,
				question_id: currentQuestion.id,
				user_type: userType,
			});
			hasTrackedCurrentQuestion.current = true;
		}
	}, [currentQuestion, currentQuestionIndex, sessionId, trackQuestionViewed, userType]);

	// Reset tracking flag when question changes
	useEffect(() => {
		hasTrackedCurrentQuestion.current = false;
		setSelectedOptionId(null);
	}, [currentQuestion]);

	// Handle back button
	useEffect(() => {
		const backAction = () => {
			trackAbandoned({
				source: 'mobile',
				session_id: sessionId || '',
				question_number: currentQuestionIndex + 1,
				total_answered: answers.length,
				user_type: userType,
			});
			onAbandon();
			return true;
		};

		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
		return () => backHandler.remove();
	}, [sessionId, currentQuestionIndex, answers.length, trackAbandoned, onAbandon, userType]);

	const handleSelectOption = async (optionId: string) => {
		if (isPending || isSubmitting || !currentQuestion || !sessionId) return;

		setIsSubmitting(true);
		setSelectedOptionId(optionId);

		const answer: Answer = {
			questionId: currentQuestion.id,
			selectedOptionId: optionId,
		};

		const allAnswers = [...answers, answer];

		addAnswer(answer);

		trackQuestionAnswered({
			source: 'mobile',
			session_id: sessionId,
			question_number: currentQuestionIndex + 1,
			question_id: currentQuestion.id,
			answer_id: optionId,
			time_spent_seconds: 0,
			user_type: userType,
		});

		await saveSession({
			sessionId,
			expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
			currentStep: currentQuestionIndex + 1,
			answers: allAnswers,
			questions,
		});

		submitAnswer(
			{
				request: {
					sessionId,
					answers: allAnswers,
				},
				lang: currentLang,
			},
			{
				onSuccess: (data) => {
					setIsSubmitting(false);

					if (data.isComplete) {
						setResult(data.result);

						trackTestCompleted({
							source: 'mobile',
							session_id: sessionId,
							result_type_id: data.result.id,
							total_questions: questions.length,
							completion_time_seconds: 0,
							user_type: userType,
						});

						clearSession();

						setTimeout(() => {
							onComplete();
						}, 300);
					} else {
						setTimeout(() => {
							nextQuestion();
						}, 300);
					}
				},
				onError: (error) => {
					console.error('Failed to submit answer:', error);
					setIsSubmitting(false);

					const currentAnswers = useTestProgress.getState().answers;
					const filteredAnswers = currentAnswers.slice(0, -1);
					useTestProgress.setState({ answers: filteredAnswers });

					emitToast(t('features.ideal-type-test.errors.submit_failed'));
				},
			},
		);
	};

	if (!currentQuestion) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={semanticColors.brand.primary} />
			</View>
		);
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top + 20 }]}>
			{/* Header with progress */}
			<View style={styles.header}>
				<Text style={styles.questionNumber}>
					{t('features.ideal-type-test.questions.question_number', {
						current: currentQuestionIndex + 1,
						total: questions.length,
					})}
				</Text>
				<ProgressBar progress={progress / 100} width={320} />
			</View>

			{/* Question + Options */}
			<Animated.View
				key={currentQuestion.id}
				entering={SlideInRight.duration(350).springify().damping(20).stiffness(200)}
				exiting={SlideOutLeft.duration(250)}
				style={styles.questionAndOptions}
			>
				<View style={styles.questionContainer}>
					<Text style={styles.questionText}>{currentQuestion.text}</Text>
				</View>

				<View style={styles.optionsContainer}>
					{currentQuestion.options.map((option, index) => (
						<OptionButton
							key={option.id}
							option={option}
							index={index}
							isSelected={selectedOptionId === option.id}
							isDisabled={isPending || isSubmitting}
							onPress={() => handleSelectOption(option.id)}
						/>
					))}
				</View>
			</Animated.View>

			{/* Progress info */}
			<View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
				<Text style={styles.progressText}>
					{t('features.ideal-type-test.questions.progress_info', {
						answered: answers.length,
						total: questions.length,
					})}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		flex: 1,
		paddingHorizontal: 24,
	},
	header: {
		alignItems: 'center',
		gap: 16,
		paddingBottom: 40,
	},
	questionNumber: {
		fontSize: 16,
		fontFamily: 'Pretendard-SemiBold',
		color: semanticColors.brand.primary,
	},
	questionAndOptions: {
		flex: 1,
	},
	questionContainer: {
		marginBottom: 40,
	},
	questionText: {
		fontSize: 24,
		fontFamily: 'Pretendard-Bold',
		color: semanticColors.text.primary,
		textAlign: 'center',
		lineHeight: 36,
	},
	optionsContainer: {
		flex: 1,
		gap: 16,
	},
	optionButton: {
		minHeight: 64,
		borderRadius: 16,
		backgroundColor: semanticColors.surface.background,
		borderWidth: 2,
		borderColor: semanticColors.border.default,
		paddingHorizontal: 20,
		paddingVertical: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	optionButtonSelected: {
		backgroundColor: semanticColors.brand.primary,
		borderColor: semanticColors.brand.primary,
	},
	optionText: {
		flex: 1,
		fontSize: 16,
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.primary,
		lineHeight: 24,
	},
	optionTextSelected: {
		color: semanticColors.surface.background,
	},
	footer: {
		alignItems: 'center',
		paddingTop: 20,
	},
	progressText: {
		fontSize: 14,
		fontFamily: 'Pretendard-Regular',
		color: semanticColors.text.disabled,
	},
});
