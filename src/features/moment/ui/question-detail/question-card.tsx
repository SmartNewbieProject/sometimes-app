import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { List, PenTool } from 'lucide-react-native';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { questionCardStyles } from './envelope.styles';

interface QuestionCardProps {
  question: string;
  questionType: 'text' | 'multiple-choice';
  onTypeToggle: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionType,
  onTypeToggle,
}) => {
  const renderQuestionText = () => {
    if (!question || typeof question !== 'string') {
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

    const lines = question.split('\n');
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

  return (
    <View style={questionCardStyles.container}>
      <View style={questionCardStyles.badge}>
        <Text size="xs" weight="bold" textColor="purple">
          From. 오늘의 질문
        </Text>
      </View>

      {renderQuestionText()}

      <TouchableOpacity
        style={questionCardStyles.toggleButton}
        onPress={onTypeToggle}
        activeOpacity={0.7}
      >
        {questionType === 'text' ? (
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
    </View>
  );
};