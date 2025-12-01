import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';

interface WeeklyReportKeywordsProps {
  keywords: string[];
}

export const WeeklyReportKeywords: React.FC<WeeklyReportKeywordsProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text size="lg" weight="bold" textColor="black" style={styles.title}>
        # 키워드
      </Text>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.keywordsContainer}
      >
        {keywords.map((keyword, index) => (
          <View key={index} style={styles.keywordChip}>
            <Text size="sm" textColor="white" weight="medium">
              {keyword.startsWith('#') ? keyword : `#${keyword}`}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  keywordChip: {
    backgroundColor: colors.primaryPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: colors.primaryPurple,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});