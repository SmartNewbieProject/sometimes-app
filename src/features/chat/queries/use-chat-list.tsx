import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { getChatList } from "../apis";

function useChatList(chatRoomId: string) {
  return useInfiniteQuery({
    queryKey: ["chat-list", chatRoomId],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      getChatList({ pageParam, chatRoomId }),
    staleTime: 0,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.nextCursor;
      }
      return undefined;
    },
  });
}

export default useChatList;
