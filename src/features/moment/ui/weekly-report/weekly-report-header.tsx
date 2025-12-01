import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';

interface WeeklyReportHeaderProps {
  title: string;
  onBack: () => void;
  showGenerateButton?: boolean;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export const WeeklyReportHeader: React.FC<WeeklyReportHeaderProps> = ({
  title,
  onBack,
  showGenerateButton = false,
  onGenerate,
  isGenerating = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Text size="sm" textColor="purple" weight="bold">
          ← 뒤로가기
        </Text>
      </TouchableOpacity>

      {/* 제목 */}
      <Text size="lg" weight="bold" textColor="black" style={styles.title}>
        {title}
      </Text>

      {/* 리포트 생성 버튼 */}
      {showGenerateButton && (
        <TouchableOpacity 
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={onGenerate}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text size="sm" textColor="white" weight="bold">
              리포트 생성
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  generateButton: {
    backgroundColor: colors.primaryPurple,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    shadowColor: colors.primaryPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
});