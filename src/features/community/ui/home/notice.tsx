import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { useHomeNotices } from "@/src/features/community/hooks/use-home";
import { Article } from "../../ui/article";

type Props = {
  pageSize?: number;
};

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
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-surface-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-surface-background">
        <Text textColor="black">공지사항을 불러오지 못했어요.</Text>
        {__DEV__ && (
          <Text size="sm" className="mt-1 opacity-60">
            {String((error as any)?.message ?? "")}
          </Text>
        )}
      </View>
    );
  }

  if (!notices.length) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-surface-background">
        <Text textColor="black">등록된 공지가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      <View className="w-full" onLayout={handlers.onLayout}>
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

      <View className="w-full flex-row items-center justify-center mt-2 mb-2">
        {Array.from({ length: total || 1 }).map((_, i) => {
          const active = i === index;
          return (
            <View
              key={i}
              className="mx-[3px] rounded-full"
              style={{
                width: active ? 8 : 6,
                height: active ? 8 : 6,
                backgroundColor: active ? "#7A4AE2" : "#D9D9D9",
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
