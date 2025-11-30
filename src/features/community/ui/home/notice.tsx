import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { semanticColors } from "@/src/shared/constants/colors";
import { Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { useHomeNotices } from "@/src/features/community/hooks/use-home";
import { Article } from "../../ui/article";

type Props = {
  pageSize?: number;
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: semanticColors.surface.background,
  },
  fullWidthContainer: {
    width: '100%',
  },
  scrollContainer: {
    width: '100%',
  },
  paginationContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  paginationDot: {
    marginHorizontal: 3,
    borderRadius: 10,
  },
  errorText: {
    marginTop: 4,
    opacity: 0.6,
  },
});

export default function Notice({ pageSize = 5 }: Props) {
  const {
    notices,
    isLoading,
    isError,
    error,
    index,
    total,
    refs,
    handlers,
    containerWidth,
  } = useHomeNotices(pageSize);

  const handlePressArticle = useCallback((id: string) => {
    router.push(`/community/${id}`);
  }, []);

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
        <Text textColor="black">공지사항을 불러오지 못했어요.</Text>
        {__DEV__ && (
          <Text size="sm" style={styles.errorText}>
            {String((error as any)?.message ?? "")}
          </Text>
        )}
      </View>
    );
  }

  if (!notices.length) {
    return (
      <View style={styles.container}>
        <Text textColor="black">등록된 공지가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullWidthContainer}>
      <View style={styles.scrollContainer} onLayout={handlers.onLayout}>
        <ScrollView
          ref={refs.scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlers.onMomentumEnd}
          scrollEventThrottle={16}
        >
          {notices.slice(0, pageSize).map((notice) => (
            <View
              key={notice.id}
              style={{ width: containerWidth || undefined }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePressArticle(notice.id)}
              >
                <Article
                  data={notice}
                  onPress={() => handlePressArticle(notice.id)}
                  onLike={() => {}}
                  onDelete={() => {}}
                  refresh={async () => {}}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.paginationContainer}>
        {Array.from({ length: total || 1 }).map((_, i) => {
          const active = i === index;
          return (
            <View
              key={i}
              style={[
                styles.paginationDot,
                {
                  width: active ? 8 : 6,
                  height: active ? 8 : 6,
                  backgroundColor: active ? "#7A4AE2" : "#D9D9D9",
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}
