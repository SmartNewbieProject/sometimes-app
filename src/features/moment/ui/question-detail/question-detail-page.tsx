import React, { useState, useEffect } from "react";
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

const { width } = Dimensions.get("window");

type QuestionStep = 'envelope' | 'reading' | 'sending' | 'sent';

export const QuestionDetailPage = () => {
  const { t } = useTranslation();
  // 상태 관리
  const [step, setStep] = useState<QuestionStep>('envelope');
  const [questionType, setQuestionType] = useState<'text' | 'multiple-choice'>('text');
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReply, setAiReply] = useState('');

  const { data: dailyQuestionResponse, isLoading: questionLoading, error: questionError, refetch: refetchDailyQuestion } = useDailyQuestionQuery();

  // 상세한 디버깅 로그 추가
  console.log('🔍 QuestionDetail Debug:', {
    dailyQuestionResponse,
    isLoading: questionLoading,
    hasQuestion: !!dailyQuestionResponse?.question,
    questionId: dailyQuestionResponse?.question?.id,
    questionText: dailyQuestionResponse?.question?.text,
    error: questionError?.message
  });

  // 실제 질문 데이터에 따라 질문 타입 초기화
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

      // 기본은 'text'로 유지, 옵션이 있는 경우에만 multiple-choice 가능
      // 단, 처음에는 무조건 'text'로 시작하여 사용자가 직접 선택하게 함
      console.log('📝 Starting with text input (default behavior)');
      // setQuestionType('text'); // 이미 기본값이 'text'이므로 설정 불필요
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

  // 핸들러 함수들
  const handleOpenLetter = () => {
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
      // text -> multiple-choice로 전환 (옵션이 있는 경우에만)
      if (hasOptions) {
        console.log('✅ Switching to multiple-choice UI');
        setQuestionType('multiple-choice');
        setSelectedOption(null);
        setTextAnswer('');
      } else {
        console.log('⚠️ Cannot switch to multiple-choice: no options available');
        // 옵션이 없는 경우 사용자에게 알림
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
      // multiple-choice -> text로 전환
      console.log('📝 Switching to text input UI');
      setQuestionType('text');
      setSelectedOption(null);
      setTextAnswer('');
    }
  };

  const handleGetInspiration = async () => {
    if (isAiLoading || !dailyQuestionResponse?.question) return;
    setIsAiLoading(true);

    try {
      // AI 영감 도우미 API 호출 (임시 구현)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const inspiration = "따뜻한 햇살 아래서...";
      setTextAnswer(prev => prev ? `${prev} ${inspiration}` : inspiration);
    } catch (error) {
      console.error("AI 영감 도우미 오류:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveAnswer = async () => {
    const questionData = dailyQuestionResponse?.question;
    const options = questionData?.options || [];
    const selectedOptionData = selectedOption !== null ? options[selectedOption] : null;

    // 유효성 검사
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

    // API 요청 데이터 구성
    const requestData = {
      questionId: questionData.id, // 변환된 ID 사용
      responseTimeSeconds,
    } as any;

    // 주관식: 항상 answerText 포함
    if (questionType === 'text') {
      requestData.answerText = textAnswer.trim();
    }

    // 선택형: answerOptionId 포함
    if (selectedOptionData) {
      requestData.answerOptionId = selectedOptionData.id;

      // 혼합형 지원: 선택형에서도 추가 텍스트 입력시 answerText 포함
      if (textAnswer.trim()) {
        requestData.answerText = textAnswer.trim();
      }
    }

    try {
      await submitAnswerMutation.mutateAsync(requestData);

      // NOTE: 답변 제출 후 refetchDailyQuestion() 호출 제거
      // TanStack Query가 자동으로 캐시 무효화 및 리프레시 처리합니다.
      // submitAnswerMutation에서 이미 invalidateQueries를 실행하고 있습니다.

      // AI 답장 생성 (임시 구현)
      const aiReplyText = "당신의 소중한 마음이 잘 도착했어요. 💌";

      // 최소 1.5초 대기
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAiReply(aiReplyText);
      setStep('sent');
    } catch (error) {
      console.error("답변 저장 실패:", error);
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
    // 완료 화면에서 나갈 때 DAILY_QUESTION 쿼리 무효화
    // 이렇게 하면 /moment 페이지 진입 시 새로운 질문 데이터를 fetch합니다.
    queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEYS.DAILY_QUESTION });
    router.push('/moment');
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
                  onTextChange={setTextAnswer}
                  onOptionSelect={setSelectedOption}
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

                {/* TODO: AI 우체부 추신 기능 구현 후 활성화
                <View style={sentStepStyles.aiReplyContainer}>
                  <View style={sentStepStyles.aiReplyHeader}>
                    <Sparkles size={16} color={colors.brand.accent} />
                    <Text size="xs" weight="bold" textColor="purple" style={sentStepStyles.aiReplyHeaderText}>
                      AI 우체부의 추신
                    </Text>
                  </View>
                  <Text size="md" weight="medium" textColor="black" style={sentStepStyles.aiReplyText}>
                    &ldquo;{aiReply}&rdquo;
                  </Text>
                </View>
                */}

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
