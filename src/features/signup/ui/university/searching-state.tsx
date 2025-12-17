import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface SearchingStateProps {
  keyword: string;
}

export function SearchingState({ keyword }: SearchingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={semanticColors.brand.primary} />
      <Text style={styles.message}>
        <Text style={styles.keyword}>{keyword}</Text> 관련 대학교를 검색하고있어요!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 24,
  },
  message: {
    fontSize: 16,
    color: semanticColors.text.secondary,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  keyword: {
    fontSize: 16,
    color: semanticColors.brand.primary,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
  },
});
