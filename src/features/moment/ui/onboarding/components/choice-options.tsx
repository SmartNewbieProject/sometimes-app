import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import type { OnboardingQuestionOption } from '../../../types';

interface ChoiceOptionsProps {
  options: OnboardingQuestionOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}

export const ChoiceOptions = ({ options, selectedOptionId, onSelect }: ChoiceOptionsProps) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
            <Text
              size="15"
              weight={isSelected ? 'semibold' : 'normal'}
              textColor={isSelected ? 'purple' : 'black'}
              style={styles.optionText}
            >
              {option.text}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  optionSelected: {
    borderColor: colors.primaryPurple,
    backgroundColor: '#F8F5FF',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioSelected: {
    borderColor: colors.primaryPurple,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryPurple,
  },
  optionText: {
    flex: 1,
    lineHeight: 22,
  },
});
