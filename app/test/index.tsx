import { axiosClient } from "@/src/shared/libs";
import type { UserProfile } from "@/src/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function Test() {
  const router = useRouter();
  const mutate = useMutation({
    mutationFn: () => axiosClient.post("/v2/matching/rematch"),
    onSuccess: async () => {},
    meta: {
      onError: {
        fallback: {
          ui: "FULL_SCREEN",
          message: "로그인 정보 확인",
        },
      },
    },
  });

  return (
    <View>
      <Pressable onPress={() => mutate.mutate()}>
        <Text>rematch test</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({});

export default Test;
