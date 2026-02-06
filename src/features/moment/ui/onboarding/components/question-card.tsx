import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlowingCard } from '@/src/shared/ui/card/glowing-card';
import { Text } from '@/src/shared/ui';

interface QuestionCardProps {
  questionText: string;
}

export const OnboardingQuestionCard = ({ questionText }: QuestionCardProps) => {
  return (
    <GlowingCard>
      <View style={styles.content}>
        <Text size="18" weight="semibold" textColor="black" style={styles.text}>
          {questionText}
        </Text>
      </View>
    </GlowingCard>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  text: {
    textAlign: 'center',
    lineHeight: 28,
  },
});
