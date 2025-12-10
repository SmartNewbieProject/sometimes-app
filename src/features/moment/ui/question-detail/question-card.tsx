import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { List, PenTool } from 'lucide-react-native';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { questionCardStyles } from './envelope.styles';
import type { Question, QuestionType } from '../../types';

interface QuestionCardProps {
  question?: string;
  questionData?: Question;
  questionType?: 'text' | 'multiple-choice' | QuestionType;
  onTypeToggle: () => void;
  canProceed?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionData,
  questionType = 'text',
  onTypeToggle,
  canProceed = true,
}) => {
  // Get question text from either legacy question string or new questionData
  const getQuestionText = () => {
    if (questionData?.text) {
      return questionData.text;
    }
    return question || '';
  };

  const renderQuestionText = () => {
    const questionText = getQuestionText();

    if (!questionText || typeof questionText !== 'string') {
      return (
        <Text
          size="xl"
          weight="bold"
          textColor="primary"
          style={questionCardStyles.questionText}
        >
          질문을 불러오는 중...
        </Text>
      );
    }

    const lines = questionText.split('\n');
    return lines.map((line, index) => (
      <Text
        key={index}
        size="xl"
        weight="bold"
        textColor="primary"
        style={questionCardStyles.questionText}
      >
        {index === 2 ? (
          <Text style={questionCardStyles.highlightText}>{line}</Text>
        ) : (
          line
        )}
        {'\n'}
      </Text>
    ));
  };

  // Determine if question type supports toggling
  // 옵션이 있는 모든 질문에서 토글을 지원
  const hasOptions = questionData?.options && questionData.options.length > 0;
  const supportsToggle = hasOptions;
  const currentType = questionType; // 현재 UI 상태 기반으로 표시

  // Debug logging
  console.log('🎯 QuestionCard Debug:', {
    hasOptions,
    supportsToggle,
    currentType,
    questionData,
    optionsCount: questionData?.options?.length || 0,
  });

  return (
    <View style={questionCardStyles.container}>
      <View style={questionCardStyles.badge}>
        <Text size="xs" weight="bold" textColor="purple">
          {canProceed ? 'From. 오늘의 질문' : '질문에 대답했어요'}
        </Text>
      </View>

      {renderQuestionText()}

      {supportsToggle && (
        <TouchableOpacity
          style={questionCardStyles.toggleButton}
          onPress={onTypeToggle}
          activeOpacity={0.7}
        >
          {currentType === 'text' ? (
            <>
              <List size={14} color={colors.text.muted} />
              <Text size="xs" weight="semibold" textColor="muted" style={questionCardStyles.toggleText}>
                보기 선택
              </Text>
            </>
          ) : (
            <>
              <PenTool size={14} color={colors.text.muted} />
              <Text size="xs" weight="semibold" textColor="muted" style={questionCardStyles.toggleText}>
                직접 입력
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};