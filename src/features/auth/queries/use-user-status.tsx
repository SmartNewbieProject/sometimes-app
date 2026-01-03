import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import i18n from "@/src/shared/libs/i18n";
import { getUserStatus } from "../apis";

function useUserStatus(phoneNumber: string | undefined) {
  const isKoreanRegion = i18n.language === 'ko';

  return useQuery({
    queryKey: ["user-status", phoneNumber],
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    queryFn: () => getUserStatus(phoneNumber!),
    staleTime: 0,
    // 한국 리전에서는 API 호출 스킵
    enabled: !!phoneNumber && !isKoreanRegion,
  });
}

export default useUserStatus;
