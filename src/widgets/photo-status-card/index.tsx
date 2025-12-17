import React from 'react';
import { View, StyleSheet } from 'react-native';
import { semanticColors } from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui/text';

interface PhotoStatusCardProps {
  approvedCount: number;
  maxCount?: number;
}

export function PhotoStatusCard({
  approvedCount,
  maxCount = 3,
}: PhotoStatusCardProps) {
  const level = approvedCount;
  const isMaxLevel = approvedCount >= maxCount;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text weight="semibold" size="xs" textColor="purple">
          현재 레벨 {level}
        </Text>
      </View>

      <View style={styles.titleContainer}>
        <Text weight="semibold" size="xl" textColor="black">
          상대방 사진을
        </Text>
        <View style={styles.highlightRow}>
          <Text weight="semibold" size="xl" textColor="purple">
            {level}장까지
          </Text>
          <Text weight="semibold" size="xl" textColor="black">
            {' '}
            볼 수 있어요
          </Text>
        </View>
      </View>

      <Text
        weight="medium"
        size="sm"
        textColor="secondary"
        style={styles.description}
      >
        {isMaxLevel
          ? '모든 사진을 볼 수 있는 최고 레벨이에요!'
          : '사진을 추가로 승인받으면 더 많은 사진을 볼 수 있어요!'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: semanticColors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  titleContainer: {
    marginBottom: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    lineHeight: 21,
  },
});
