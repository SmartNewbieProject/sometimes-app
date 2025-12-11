import React, { useEffect, useRef } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";
import { router } from "expo-router";
import { useAnswerHistoryInfiniteQuery } from "../../queries";
import type { AnswerHistoryItem } from "../../apis";
import { useMomentAnalytics } from "../../hooks/use-moment-analytics";

export const MyAnswersPage = () => {
  const {
    data: answerHistoryData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useAnswerHistoryInfiniteQuery();

  const { trackMyAnswersView, trackHistoryAnswerClick, trackHistoryScrollLoadMore } = useMomentAnalytics();
  const pageLoadedRef = useRef(0);

  useEffect(() => {
    if (!isLoading) {
      trackMyAnswersView({ source: 'navigation' });
    }
  }, [isLoading]);

  const answerHistory = answerHistoryData?.pages.flatMap(page => page.answers) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatResponseTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}초`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
    } else {
      return `${Math.floor(seconds / 3600)}시간 ${Math.floor((seconds % 3600) / 60)}분`;
    }
  };

  const handleAnswerPress = (item: AnswerHistoryItem) => {
    trackHistoryAnswerClick({
      question_id: item.questionId,
      question_text: item.questionText,
      answer_position: answerHistory.findIndex(a => a.id === item.id),
    });
    router.push(`/moment/question-detail?questionId=${item.questionId}`);
  };

  const renderAnswerItem = ({ item }: { item: AnswerHistoryItem }) => (
    <TouchableOpacity
      style={styles.answerCard}
      activeOpacity={0.7}
      onPress={() => handleAnswerPress(item)}
    >
      <View style={styles.header}>
        <Text size="14" weight="medium" textColor="gray" style={styles.date}>
          {formatDate(item.createdAt)}
        </Text>
        <View style={styles.responseTime}>
          <Text size="12" weight="normal" textColor="gray">
            {formatResponseTime(item.responseTimeSeconds)}
          </Text>
        </View>
      </View>

      <Text size="16" weight="bold" textColor="black" style={styles.question}>
        {item.questionText}
      </Text>

      <View style={styles.answerContainer}>
        <Text size="15" weight="normal" textColor="dark" style={styles.answer}>
          {item.answerText}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text size="13" weight="medium" textColor="purple">
          다시보기 {'>'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text size="16" weight="medium" textColor="gray" style={styles.emptyText}>
        아직 답변 기록이 없어요
      </Text>
      <Text size="14" weight="normal" textColor="gray">
        오늘의 질문에 답변하고 기록을 남겨보세요!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={semanticColors.brand.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text size="18" weight="bold" textColor="black" style={styles.headerTitle}>
          내 답변 기록
        </Text>
        <Text size="14" weight="normal" textColor="gray" style={styles.headerSubtitle}>
          그동안 답변한 질문들을 다시 볼 수 있어요
        </Text>
      </View>

      {answerHistory.length > 0 ? (
        <FlatList
          data={answerHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAnswerItem}
          onEndReached={() => {
            if (hasNextPage) {
              pageLoadedRef.current += 1;
              trackHistoryScrollLoadMore({ page_number: pageLoadedRef.current });
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={semanticColors.brand.primary} />
              </View>
            ) : null
          }
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: colors.white,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  answerCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: {
    flex: 1,
  },
  responseTime: {
    backgroundColor: colors.moreLightPurple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  question: {
    marginBottom: 8,
    lineHeight: 22,
  },
  answerContainer: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  answer: {
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: "center",
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
  },
});