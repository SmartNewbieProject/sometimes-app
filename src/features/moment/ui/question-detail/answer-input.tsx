import React from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Sparkles, Loader2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, Button } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { answerInputStyles } from './envelope.styles';
import { LinearGradient } from 'expo-linear-gradient';

interface AnswerInputProps {
  questionType: 'text' | 'multiple-choice';
  textAnswer: string;
  selectedOption: number | null;
  options: { id: string; text: string; order?: number }[];
  onTextChange: (text: string) => void;
  onOptionSelect: (index: number) => void;
  onGetInspiration: () => void;
  isAiLoading: boolean;
  isSending: boolean;
  onSubmit: () => void;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  questionType,
  textAnswer,
  selectedOption,
  options,
  onTextChange,
  onOptionSelect,
  onGetInspiration,
  isAiLoading,
  isSending,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const isTextValid = textAnswer.trim().length > 0;
  const isOptionValid = selectedOption !== null;
  const isValid = questionType === 'text' ? isTextValid : isOptionValid;

  const renderLines = () => {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { paddingTop: 9, paddingHorizontal: 24 }]}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={i}
            style={{
              height: 46, // 조정된 lineHeight와 맞춤
              borderBottomWidth: 1,
              borderBottomColor: '#F0F0F0',
            }}
          />
        ))}
      </View>
    );
  };

  const renderTextInput = () => (
    <View style={answerInputStyles.textInputContainer}>
      {renderLines()}
      <TextInput
        style={answerInputStyles.textInput}
        placeholder={t('features.moment.question_detail.answer_input.placeholder')}
        placeholderTextColor={semanticColors.text.disabled}
        value={textAnswer}
        onChangeText={(text) => {
          const lineCount = text.split('\n').length;
          if (lineCount <= 16) {
            onTextChange(text);
          }
        }}
        multiline
        textAlignVertical="top"
        underlineColorAndroid="transparent"
        maxLength={500}
        scrollEnabled={false}
      />
    </View>
  );

  const renderOptionInput = () => (
    <ScrollView style={answerInputStyles.optionsContainer} showsVerticalScrollIndicator={false}>
      <View style={{ paddingBottom: 20 }}>
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          return (
            <TouchableOpacity
              key={`${option.id}-${index}`}
              style={[
                answerInputStyles.optionButton,
                isSelected
                  ? answerInputStyles.optionButtonSelected
                  : answerInputStyles.optionButtonUnselected,
              ]}
              onPress={() => onOptionSelect(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  answerInputStyles.optionRadio,
                  isSelected
                    ? answerInputStyles.optionRadioSelected
                    : answerInputStyles.optionRadioUnselected,
                ]}
              >
                {isSelected && <Check size={12} color="white" />}
              </View>
              <Text
                size="md"
                weight="medium"
                textColor={isSelected ? "purple" : "black"}
                style={[
                  answerInputStyles.optionText,
                  isSelected
                    ? answerInputStyles.optionTextSelected
                    : answerInputStyles.optionTextUnselected,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <View style={answerInputStyles.container}>
      <View style={answerInputStyles.header}>
        <Text size="xs" weight="semibold" textColor="muted" style={answerInputStyles.headerText}>
          {t('features.moment.question_detail.answer_input.to_myself')}
        </Text>

        <View style={answerInputStyles.statusContainer}>
          {/* AI 영감 기능 - 현재 미사용
          {questionType === 'text' && (
            <TouchableOpacity
              onPress={onGetInspiration}
              disabled={isAiLoading}
              activeOpacity={0.7}
              style={{ marginRight: 12 }}
            >
              <LinearGradient
                colors={['#F3E8FF', '#FCE7F3']} // purple-100 to pink-100
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                {isAiLoading ? (
                  <Loader2 size={12} color={semanticColors.brand.primary} />
                ) : (
                  <Sparkles size={12} color={semanticColors.brand.primary} />
                )}
                <Text size="xs" weight="bold" textColor="purple" style={{ marginLeft: 4 }}>
                  AI 영감
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          */}

          <Text
            size="xs"
            weight="medium"
            textColor={isValid ? "purple" : "muted"}
            style={[
              answerInputStyles.statusText,
            ]}
          >
            {questionType === 'text'
              ? t('features.moment.question_detail.answer_input.writing_count', { count: textAnswer.length })
              : isOptionValid
                ? t('features.moment.question_detail.answer_input.selection_complete')
                : t('features.moment.question_detail.answer_input.select_answer')}
          </Text>
        </View>
      </View>

      {questionType === 'text' ? renderTextInput() : renderOptionInput()}

      <View style={answerInputStyles.submitButton}>
        <Button
          onPress={onSubmit}
          disabled={!isValid || isSending}
          size="md"
          width="full"
          textColor={isValid && !isSending ? "white" : "gray"}
          styles={{
            backgroundColor: isValid && !isSending ? semanticColors.brand.primary : colors.cardPurple,
            shadowColor: isValid && !isSending ? colors.lightPurple : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isValid && !isSending ? 0.5 : 0,
            shadowRadius: 8,
            elevation: isValid && !isSending ? 4 : 0,
            width: '100%',
          }}
        >
          {isSending ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Loader2 size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Text textColor="white" weight="bold">{t('features.moment.question_detail.answer_input.sending')}</Text>
            </View>
          ) : (
            t('features.moment.question_detail.answer_input.submit')
          )}
        </Button>
      </View>
    </View>
  );
};