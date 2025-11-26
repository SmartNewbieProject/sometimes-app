import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { Heart, List, PenTool, Loader2, Check, Sparkles , ArrowLeft } from "lucide-react-native";
import { Text, Button } from "@/src/shared/ui";
import colors from "@/src/shared/constants/colors";
import { Stack, router } from "expo-router";
import { useDailyQuestionQuery, useSubmitAnswerMutation } from "../../queries";
import { useModal } from "@/src/shared/hooks/use-modal";
import type { UpdatedDailyQuestionResponse } from "../../apis";
import { Envelope } from "./envelope";
import { QuestionCard } from "./question-card";
import { AnswerInput } from "./answer-input";
import { sentStepStyles } from "./envelope.styles";

const { width } = Dimensions.get("window");

type QuestionStep = 'envelope' | 'reading' | 'sending' | 'sent';

export const QuestionDetailPage = () => {
  // 상태 관리
  const [step, setStep] = useState<QuestionStep>('envelope');
  const [questionType, setQuestionType] = useState<'text' | 'multiple-choice'>('text');
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReply, setAiReply] = useState('');

  const { data: questionData, isLoading: questionLoading, refetch: refetchDailyQuestion } = useDailyQuestionQuery();
  const submitAnswerMutation = useSubmitAnswerMutation();
  const { showModal } = useModal();

  const getCurrentDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[now.getDay()];

    return `${year}. ${month}. ${day}. (${weekday})`;
  };

  const questionDate = getCurrentDateString();

  // 핸들러 함수들
  const handleOpenLetter = () => {
    setStep('reading');
  };

  const toggleQuestionType = () => {
    setQuestionType(prev => prev === 'text' ? 'multiple-choice' : 'text');
    setSelectedOption(null);
    setTextAnswer('');
  };

  const handleGetInspiration = async () => {
    if (isAiLoading || !questionData) return;
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
    const options = questionData?.options || [];
    const selectedOptionData = selectedOption !== null ? options[selectedOption] : null;

    // 유효성 검사
    const isValid = questionType === 'text'
      ? textAnswer.trim().length > 0
      : selectedOptionData !== null;

    if (!isValid || !questionData) {
      showModal({
        title: "알림",
        children: <Text>답변을 입력해주세요.</Text>,
        primaryButton: {
          text: "확인",
          onClick: () => { },
        },
      });
      return;
    }

    setStep('sending');

    const responseTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    // API 요청 데이터 구성
    const requestData = {
      questionId: questionData.questionId, // string 유지
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

      // 답변 제출 성공 후 데이터 리프레시
      await refetchDailyQuestion();

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
        title: "오류",
        children: <Text>답변 저장에 실패했습니다. 다시 시도해주세요.</Text>,
        primaryButton: {
          text: "확인",
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
    // 모먼트 질문함 페이지로 이동
    router.push('/moment');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Stack.Screen
          options={{
            headerTitle: "오늘의 우체통",
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: colors.momentBackground },
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.push("/moment/my-moment")} style={{ marginLeft: 16 }}>
                <ArrowLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }}
        />

        {questionLoading ? (
          <View style={styles.loadingContainer}>
            <Text size="lg" weight="medium" textColor="gray">
              오늘의 질문을 불러오는 중...
            </Text>
          </View>
        ) : !questionData ? (
          <View style={styles.noQuestionContainer}>
            <Image
              source={require("@/assets/images/moment/envelope.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text size="18" weight="bold" textColor="black" style={styles.noQuestionText}>
              오늘의 질문이 없습니다
            </Text>
            <Text size="md" weight="medium" textColor="gray" style={styles.noQuestionSubText}>
              내일 다시 방문해주세요
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
                  question={questionData.text}
                  questionType={questionType}
                  onTypeToggle={toggleQuestionType}
                />

                <AnswerInput
                  questionType={questionType}
                  textAnswer={textAnswer}
                  selectedOption={selectedOption}
                  options={questionData.options?.map(o => o.text) || []}
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
                  답장이 전송되었습니다
                </Text>

                <View style={sentStepStyles.aiReplyContainer}>
                  <View style={sentStepStyles.aiReplyHeader}>
                    <Sparkles size={16} color={colors.brand.accent} />
                    <Text size="xs" weight="bold" textColor="purple" style={sentStepStyles.aiReplyHeaderText}>
                      AI 우체부의 추신
                    </Text>
                  </View>
                  <Text size="md" weight="medium" textColor="black" style={sentStepStyles.aiReplyText}>
                    "{aiReply}"
                  </Text>
                </View>

                <Button
                  onPress={handleBackToMoment}
                  size="md"
                  variant="primary"
                  styles={sentStepStyles.backButton}
                  textColor="white"
                >
                  질문함으로 돌아가기
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
