import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { Text, Button } from '@/src/shared/ui';
import { ProgressBar } from '@/src/shared/ui/progress-bar';
import colors from '@/src/shared/constants/colors';
import { Header } from '@/src/shared/ui/header';

import { useOnboardingQuestionsQuery, useSubmitOnboardingMutation } from '../../queries/onboarding';
import { useMomentOnboarding } from '../../hooks/use-moment-onboarding';
import { OnboardingQuestionCard, ChoiceOptions, OnboardingTextInput } from './components';
import { MOMENT_ONBOARDING_KEYS } from './keys';

const { width } = Dimensions.get('window');

export const OnboardingQuestions = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { data: questionsData, isLoading: isLoadingQuestions } = useOnboardingQuestionsQuery();
  const submitMutation = useSubmitOnboardingMutation();

  const {
    currentStep,
    totalSteps,
    questions,
    answers,
    setQuestions,
    setAnswer,
    nextStep,
    prevStep,
    getCurrentQuestion,
    getProgress,
    isLastStep,
    canProceed,
    getAnswersArray,
  } = useMomentOnboarding();

  useEffect(() => {
    if (questionsData?.questions) {
      setQuestions(questionsData.questions);
    }
  }, [questionsData]);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : null;

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswer(currentQuestion.id, {
      questionId: currentQuestion.id,
      answerOptionId: optionId,
    });
  };

  const handleTextChange = (text: string) => {
    if (!currentQuestion) return;
    setAnswer(currentQuestion.id, {
      questionId: currentQuestion.id,
      answerText: text,
    });
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (isLastStep()) {
      // 마지막 질문 - 제출
      const answersArray = getAnswersArray();
      try {
        const result = await submitMutation.mutateAsync({ answers: answersArray });
        if (result.success) {
          router.replace({
            pathname: '/moment/onboarding/result',
            params: { reportData: JSON.stringify(result.report) },
          });
        }
      } catch (error) {
        // 에러 처리는 mutation에서 처리
      }
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.back();
    } else {
      prevStep();
    }
  };

  if (isLoadingQuestions || !currentQuestion) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryPurple} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton visible onPress={handleBack} />
        </Header.LeftContent>
        <Header.Logo title={t(MOMENT_ONBOARDING_KEYS.questions.headerTitle)} showLogo={false} />
        <Header.RightContent>
          <Text size="14" weight="medium" textColor="gray">
            {currentStep + 1}/{totalSteps}
          </Text>
        </Header.RightContent>
      </Header.Container>

      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} width={width - 48} />
      </View>

      <View style={styles.content}>
        <View style={styles.questionContainer}>
          <OnboardingQuestionCard questionText={currentQuestion.text} />
        </View>

        <View style={styles.answerContainer}>
          {currentQuestion.type === 'choice' && currentQuestion.options ? (
            <ChoiceOptions
              options={currentQuestion.options}
              selectedOptionId={currentAnswer?.answerOptionId ?? null}
              onSelect={handleOptionSelect}
            />
          ) : (
            <OnboardingTextInput
              value={currentAnswer?.answerText ?? ''}
              onChange={handleTextChange}
              placeholder={currentQuestion.placeholder ?? t(MOMENT_ONBOARDING_KEYS.questions.placeholder)}
              maxLength={currentQuestion.maxLength ?? 500}
            />
          )}
        </View>
      </View>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleNext}
          disabled={!canProceed() || submitMutation.isPending}
          style={styles.nextButton}
        >
          {isLastStep()
            ? t(MOMENT_ONBOARDING_KEYS.questions.submitButton)
            : t(MOMENT_ONBOARDING_KEYS.questions.nextButton)
          }
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionContainer: {
    marginTop: 16,
    marginBottom: 32,
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
