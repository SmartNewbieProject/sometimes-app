import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { getChatRoomDetail } from "../apis";

export function useChatRoomDetail(chatRoomId: string) {
  return useQuery({
    queryKey: ["chat-detail", chatRoomId],
    queryFn: () => getChatRoomDetail(chatRoomId),
    enabled: !!chatRoomId,
  });
}

export default useChatRoomDetail;
