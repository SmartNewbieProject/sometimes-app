import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { getUserStatus } from "../apis";

function useUserStatus(phoneNumber: string | undefined) {
  return useQuery({
    queryKey: ["user-status", phoneNumber],
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    queryFn: () => getUserStatus(phoneNumber!),
    staleTime: 0,
    enabled: !!phoneNumber,
  });
}

export default useUserStatus;
