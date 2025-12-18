import React from "react";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/src/shared/ui";
import { useHomeHots } from "@/src/features/community/hooks/use-home";
import { router } from "expo-router";

type Props = {
  pageSize?: number;
};

export default function Hot({ pageSize = 5 }: Props) {
  const { hots, total, isLoading, isError, error } = useHomeHots(pageSize);

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.emptyContainer}>
        <Text textColor="black">인기 글을 불러오지 못했어요.</Text>
        {__DEV__ && (
          <Text size="sm" style={styles.errorText}>
            {String((error as any)?.message ?? "")}
          </Text>
        )}
      </View>
    );
  }

  if (!hots.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text textColor="black">현재 인기 글이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hots.slice(0, total).map((item, idx) => {
        const isLast = idx === total - 1;
        return (
          <View key={item.id}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/community/${item.id}`)}
              style={styles.itemRow}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.titleText}
              >
                {item.title}
              </Text>
              <Text style={styles.categoryText}>
                {item.categoryName}
              </Text>
            </TouchableOpacity>
            {!isLast && <View style={styles.separator} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: semanticColors.surface.background,
  },
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemRow: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    flex: 1,
    overflow: "hidden",
    color: semanticColors.text.muted,
    fontFamily: "Pretendard",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "400" as any,
    lineHeight: 16.8,
  },
  categoryText: {
    marginLeft: 8,
    color: semanticColors.text.disabled,
    fontFamily: "Pretendard",
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "400" as any,
    lineHeight: 14.4,
  },
  separator: {
    height: 1,
    backgroundColor: semanticColors.surface.other,
  },
  errorText: {
    marginTop: 4,
    opacity: 0.6,
  },
});
