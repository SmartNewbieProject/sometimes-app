import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/shared/ui";
import { useHomeHots } from "@/src/features/community/hooks/use-home";
import { router } from "expo-router";
import { ActivityIndicator } from "react-native";

type Props = {
  pageSize?: number; // 기본 5
};

export default function Hot({ pageSize = 5 }: Props) {
  const { hots, total, isLoading, isError, error } = useHomeHots(pageSize);

  if (isLoading) {
    return (
      <View className="mx-[16px] my-[12px] py-6 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="mx-[16px] my-[12px] py-6 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <Text textColor="black">인기 글을 불러오지 못했어요.</Text>
        {__DEV__ && (
          <Text size="sm" className="mt-1 opacity-60">
            {String((error as any)?.message ?? "")}
          </Text>
        )}
      </View>
    );
  }

  if (!hots.length) {
    return (
      <View className="mx-[16px] my-[12px] py-6 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <Text textColor="black">현재 인기 글이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className="mx-[16px] my-[12px] rounded-[8px] bg-white px-3 py-2">
      {hots.slice(0, total).map((item, idx) => {
        const isLast = idx === total - 1;
        return (
          <View key={item.id}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/community/${item.id}`)}
              className="py-2 flex-row items-center"
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  flex: 1,
                  overflow: "hidden",
                  color: "#646464",
                  fontFamily: "Pretendard",
                  fontSize: 14,
                  fontStyle: "normal",
                  fontWeight: "400" as any,
                  lineHeight: 16.8,
                  fontFeatureSettings: "'liga' off, 'clig' off",
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  color: "#9E9E9E",
                  fontFamily: "Pretendard",
                  fontSize: 12,
                  fontStyle: "normal",
                  fontWeight: "400" as any,
                  lineHeight: 14.4,
                }}
              >
                {item.categoryName}
              </Text>
            </TouchableOpacity>
            {!isLast && (
              <View
                style={{
                  height: 1,
                  backgroundColor: "#F3F0FF",
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
