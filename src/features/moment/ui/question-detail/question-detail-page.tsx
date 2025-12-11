import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, TouchableOpacity, BackHandler } from "react-native";
import { Heart, List, PenTool, Loader2, Check, Sparkles , ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, Button } from "@/src/shared/ui";
import colors from "@/src/shared/constants/colors";
import { Stack, router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useDailyQuestionQuery, useSubmitAnswerMutation } from "../../queries";
import { MOMENT_QUERY_KEYS } from "../../apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import type { DailyQuestionResponse } from "../../types";
import { Envelope } from "./envelope";
import { QuestionCard } from "./question-card";
import { AnswerInput } from "./answer-input";
import { sentStepStyles } from "./envelope.styles";
import { useMomentAnalytics } from "../../hooks/use-moment-analytics";

const { width } = Dimensions.get("window");

type QuestionStep = 'envelope' | 'reading' | 'sending' | 'sent';

export const QuestionDetailPage = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<QuestionStep>('envelope');
  const [questionType, setQuestionType] = useState<'text' | 'multiple-choice'>('text');
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const textInputStartTracked = useRef(false);

  const { data: dailyQuestionResponse, isLoading: questionLoading, error: questionError, refetch: refetchDailyQuestion } = useDailyQuestionQuery();

  const {
    trackQuestionDetailView,
    trackQuestionEnvelopeView,
    trackQuestionEnvelopeOpen,
    trackQuestionReadingStart,
    trackQuestionTypeToggle,
    trackQuestionAIInspirationClick,
    trackQuestionAIInspirationApply,
    trackQuestionTextInputStart,
    trackQuestionOptionSelect,
    trackQuestionSubmitAttempt,
    trackQuestionSubmitSuccess,
    trackQuestionSubmitFail,
    trackQuestionRewardView,
    trackQuestionCompleteBack,
  } = useMomentAnalytics();

  const getQuestionProperties = useCallback(() => {
    const question = dailyQuestionResponse?.question;
    if (!question) return null;
    return {
      question_id: question.id,
      question_text: question.text,
      question_type: question.type as 'text' | 'single_choice',
      dimension: question.dimension,
      has_options: !!(question.options && question.options.length > 0),
    };
  }, [dailyQuestionResponse?.question]);

  // 상세한 디버깅 로그 추가
  console.log('🔍 QuestionDetail Debug:', {
    dailyQuestionResponse,
    isLoading: questionLoading,
    hasQuestion: !!dailyQuestionResponse?.question,
    questionId: dailyQuestionResponse?.question?.id,
    questionText: dailyQuestionResponse?.question?.text,
    error: questionError?.message
  });

  useEffect(() => {
    if (dailyQuestionResponse?.question) {
      const question = dailyQuestionResponse.question;

      console.log('📋 Question data received:', {
        id: question.id,
        text: question.text,
        type: question.type,
        dimension: question.dimension,
        options: question.options,
        optionsCount: question.options?.length || 0,
      });

      const props = getQuestionProperties();
      if (props) {
        trackQuestionDetailView(props);
        trackQuestionEnvelopeView(props);
      }

      console.log('📝 Starting with text input (default behavior)');
    }
  }, [dailyQuestionResponse?.question]);
  const queryClient = useQueryClient();
  const submitAnswerMutation = useSubmitAnswerMutation();
  const { showModal } = useModal();

  const getCurrentDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const weekday = t(`features.moment.question_detail.weekdays.${weekdayKeys[now.getDay()]}`);

    return `${year}. ${month}. ${day}. (${weekday})`;
  };

  const questionDate = getCurrentDateString();

  const handleOpenLetter = () => {
    const props = getQuestionProperties();
    if (props) {
      trackQuestionEnvelopeOpen(props);
      trackQuestionReadingStart(props);
    }
    setStep('reading');
  };

  const toggleQuestionType = () => {
    const question = dailyQuestionResponse?.question;
    const hasOptions = question?.options && question.options.length > 0;

    console.log('🔄 Toggle Question Type:', {
      currentType: questionType,
      hasOptions,
      optionsCount: question?.options?.length || 0,
    });

    if (questionType === 'text') {
      if (hasOptions) {
        console.log('✅ Switching to multiple-choice UI');
        if (question) {
          trackQuestionTypeToggle({
            question_id: question.id,
            from_type: 'text',
            to_type: 'multiple-choice',
          });
        }
        setQuestionType('multiple-choice');
        setSelectedOption(null);
        setTextAnswer('');
      } else {
        console.log('⚠️ Cannot switch to multiple-choice: no options available');
        showModal({
          title: t('features.moment.question_detail.modal.notice'),
          children: <Text size="14" weight="normal" textColor="dark">{t('features.moment.question_detail.modal.no_multiple_choice')}</Text>,
          primaryButton: {
            text: t('features.moment.question_detail.modal.confirm'),
            onClick: () => { },
          },
        });
      }
    } else {
      console.log('📝 Switching to text input UI');
      if (question) {
        trackQuestionTypeToggle({
          question_id: question.id,
          from_type: 'multiple-choice',
          to_type: 'text',
        });
      }
      setQuestionType('text');
      setSelectedOption(null);
      setTextAnswer('');
    }
  };

  const handleGetInspiration = async () => {
    if (isAiLoading || !dailyQuestionResponse?.question) return;
    const question = dailyQuestionResponse.question;
    trackQuestionAIInspirationClick({ question_id: question.id });
    setIsAiLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const inspiration = t('features.moment.question_detail.inspiration.sample');
      setTextAnswer(prev => prev ? `${prev} ${inspiration}` : inspiration);
      trackQuestionAIInspirationApply({ question_id: question.id, suggestion_length: inspiration.length });
    } catch (error) {
      console.error("AI inspiration error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveAnswer = async () => {
    const questionData = dailyQuestionResponse?.question;
    const options = questionData?.options || [];
    const selectedOptionData = selectedOption !== null ? options[selectedOption] : null;

    const isValid = questionType === 'text'
      ? textAnswer.trim().length > 0
      : selectedOptionData !== null;

    if (!isValid || !questionData) {
      showModal({
        title: t('features.moment.question_detail.modal.notice'),
        children: <Text>{t('features.moment.question_detail.modal.enter_answer')}</Text>,
        primaryButton: {
          text: t('features.moment.question_detail.modal.confirm'),
          onClick: () => { },
        },
      });
      return;
    }

    setStep('sending');

    const responseTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const answerType = questionType === 'text' ? 'text' : (textAnswer.trim() ? 'mixed' : 'option');
    const submitProps = {
      question_id: questionData.id,
      answer_type: answerType as 'text' | 'option' | 'mixed',
      text_length: textAnswer.trim().length,
      option_id: selectedOptionData?.id,
      option_index: selectedOption ?? undefined,
      response_time_seconds: responseTimeSeconds,
      total_time_seconds: responseTimeSeconds,
    };

    trackQuestionSubmitAttempt(submitProps);

    const requestData = {
      questionId: questionData.id,
      responseTimeSeconds,
    } as any;

    if (questionType === 'text') {
      requestData.answerText = textAnswer.trim();
    }

    if (selectedOptionData) {
      requestData.answerOptionId = selectedOptionData.id;

      if (textAnswer.trim()) {
        requestData.answerText = textAnswer.trim();
      }
    }

    try {
      await submitAnswerMutation.mutateAsync(requestData);

      trackQuestionSubmitSuccess(submitProps);

      const aiReplyText = t('features.moment.question_detail.sent.ai_reply');

      await new Promise(resolve => setTimeout(resolve, 1500));

      setAiReply(aiReplyText);
      setStep('sent');

      trackQuestionRewardView({
        question_id: questionData.id,
        question_text: questionData.text,
        reward_type: 'gem',
        reward_amount: 1,
      });
    } catch (error: any) {
      console.error("답변 저장 실패:", error);
      trackQuestionSubmitFail({
        ...submitProps,
        error_message: error?.message || 'Unknown error',
        error_code: error?.code || error?.status?.toString(),
      });
      setStep('reading');
      showModal({
        title: t('features.moment.question_detail.modal.error'),
        children: <Text>{t('features.moment.question_detail.modal.save_failed')}</Text>,
        primaryButton: {
          text: t('features.moment.question_detail.modal.confirm'),
          onClick: () => { },
        },
      });
    }
  };

  const handleReset = () => {
    setStep('envelope');
    setTextAnswer('');
    setSelectedOption(null);
    setQuestionType('text');
    setAiReply('');
  };

  const handleBackToMoment = () => {
    const props = getQuestionProperties();
    if (props) {
      trackQuestionCompleteBack(props);
    }
    queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.DAILY_QUESTION });
    router.push('/moment/my-moment');
  };

  // 하드웨어 뒤로가기 버튼 핸들링 (Android)
  // 완료 화면(sent)에서 뒤로가기 시에도 쿼리 무효화가 필요
  useEffect(() => {
    const backAction = () => {
      if (step === 'sent') {
        handleBackToMoment();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [step]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Stack.Screen
          options={{
            headerTitle: t('features.moment.question_detail.header_title'),
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: colors.momentBackground },
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  if (step === 'sent') {
                    handleBackToMoment();
                  } else {
                    router.push("/moment/my-moment");
                  }
                }}
                style={{ marginLeft: 16 }}
              >
                <ArrowLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }}
        />

        {questionLoading ? (
          <View style={styles.loadingContainer}>
            <Text size="lg" weight="medium" textColor="gray">
              {t('features.moment.question_detail.loading')}
            </Text>
          </View>
        ) : questionError ? (
          <View style={styles.errorContainer}>
            <Image
              source={require("@/assets/images/moment/envelope.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text size="18" weight="bold" textColor="black" style={styles.noQuestionText}>
              {t('features.moment.question_detail.error_loading')}
            </Text>
            <Text size="md" weight="medium" textColor="gray" style={styles.noQuestionSubText}>
              {questionError.message || t('features.moment.question_detail.check_network')}
            </Text>

            {/* Debug 정보 */}
            <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <Text size="xs" weight="medium" textColor="red">
                {t('features.moment.question_detail.debug_info')}: {questionError.message}
              </Text>
              {questionError.status && (
                <Text size="xs" textColor="red">
                  {t('features.moment.question_detail.status_code')}: {questionError.status}
                </Text>
              )}
            </View>

            <Button
              onPress={() => refetchDailyQuestion()}
              size="md"
              variant="primary"
              style={{ marginTop: 16 }}
            >
              {t('features.moment.question_detail.retry')}
            </Button>
          </View>
        ) : !dailyQuestionResponse?.question ? (
          <View style={styles.noQuestionContainer}>
            <Image
              source={require("@/assets/images/moment/envelope.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text size="18" weight="bold" textColor="black" style={styles.noQuestionText}>
              {t('features.moment.question_detail.no_question')}
            </Text>
            <Text size="md" weight="medium" textColor="gray" style={styles.noQuestionSubText}>
              {t('features.moment.question_detail.visit_tomorrow')}
            </Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* STEP 1: 편지 도착 (Envelope) */}
            {step === 'envelope' && (
              <Envelope
                onPress={handleOpenLetter}
                questionDate={questionDate}
              />
            )}

            {/* STEP 2: 읽기 및 쓰기 (Reading) */}
            {(step === 'reading' || step === 'sending') && (
              <View style={styles.readingContainer}>
                <QuestionCard
                  question={dailyQuestionResponse?.question?.text || ''}
                  questionData={dailyQuestionResponse?.question}
                  questionType={questionType}
                  onTypeToggle={toggleQuestionType}
                />

                <AnswerInput
                  questionType={questionType}
                  textAnswer={textAnswer}
                  selectedOption={selectedOption}
                  options={dailyQuestionResponse?.question?.options || []}
                  onTextChange={(text) => {
                    if (!textInputStartTracked.current && text.length > 0) {
                      textInputStartTracked.current = true;
                      const props = getQuestionProperties();
                      if (props) trackQuestionTextInputStart(props);
                    }
                    setTextAnswer(text);
                  }}
                  onOptionSelect={(index) => {
                    const question = dailyQuestionResponse?.question;
                    const options = question?.options || [];
                    if (question && index !== null && options[index]) {
                      trackQuestionOptionSelect({
                        question_id: question.id,
                        option_id: options[index].id,
                        option_index: index,
                      });
                    }
                    setSelectedOption(index);
                  }}
                  onGetInspiration={handleGetInspiration}
                  isAiLoading={isAiLoading}
                  isSending={step === 'sending'}
                  onSubmit={handleSaveAnswer}
                />
              </View>
            )}

            {/* STEP 3: 완료 (Sent) */}
            {step === 'sent' && (
              <View style={sentStepStyles.container}>
                <View style={sentStepStyles.successCircle}>
                  <View style={sentStepStyles.successCircleGlow} />
                  <Check size={40} color={colors.brand.primary} strokeWidth={3} />
                </View>
                <Text size="2xl" weight="bold" textColor="primary" style={sentStepStyles.titleText}>
                  {t('features.moment.question_detail.sent.success')}
                </Text>

                <View style={sentStepStyles.rewardContainer}>
                  <Image
                    source={require("@/assets/images/promotion/home-banner/gem.png")}
                    style={sentStepStyles.gemIcon}
                    resizeMode="contain"
                  />
                  <Text size="14" weight="medium" textColor="purple">
                    {t('features.moment.question_detail.sent.reward_message')}
                  </Text>
                </View>

                <Button
                  onPress={handleBackToMoment}
                  size="md"
                  variant="primary"
                  styles={sentStepStyles.backButton}
                  textColor="white"
                >
                  {t('features.moment.question_detail.sent.back_to_moment')}
                </Button>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.momentBackground,
  },
  container: {
    flex: 1,
    backgroundColor: colors.momentBackground,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noQuestionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  readingContainer: {
    flex: 1,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  noQuestionText: {
    marginBottom: 10,
  },
  noQuestionSubText: {
    opacity: 0.8,
  },
});
