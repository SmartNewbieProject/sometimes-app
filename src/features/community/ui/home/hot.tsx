import React from "react";
import { semanticColors } from '@/src/shared/constants/colors';
import { View, TouchableOpacity , ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "@/src/shared/ui";
import { useHomeHots } from "@/src/features/community/hooks/use-home";
import { router } from "expo-router";

type Props = {
  pageSize?: number; // 기본 5
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: semanticColors.surface.background,
  },
  hotListContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hotItemContainer: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotItemTitle: {
    flex: 1,
    overflow: 'hidden',
    color: semanticColors.text.muted,
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 16.8,
    fontFeatureSettings: "'liga' off, 'clig' off",
  },
  hotItemCategory: {
    marginLeft: 8,
    color: semanticColors.text.disabled,
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 14.4,
  },
  divider: {
    height: 1,
    backgroundColor: semanticColors.surface.other,
  },
  errorMessage: {
    marginTop: 4,
    opacity: 0.6,
  },
});

export default function Hot({ pageSize = 5 }: Props) {
  const { hots, total, isLoading, isError, error } = useHomeHots(pageSize);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text textColor="black">인기 글을 불러오지 못했어요.</Text>
        {__DEV__ && (
          <Text size="sm" style={styles.errorMessage}>
            {String((error as any)?.message ?? "")}
          </Text>
        )}
      </View>
    );
  }

  if (!hots.length) {
    return (
      <View style={styles.container}>
        <Text textColor="black">현재 인기 글이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.hotListContainer}>
      {hots.slice(0, total).map((item, idx) => {
        const isLast = idx === total - 1;
        return (
          <View key={item.id}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/community/${item.id}`)}
              style={styles.hotItemContainer}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.hotItemTitle}
              >
                {item.title}
              </Text>
              <Text style={styles.hotItemCategory}>
                {item.categoryName}
              </Text>
            </TouchableOpacity>
            {!isLast && <View style={styles.divider} />}
          </View>
        );
      })}
    </View>
  );
}
