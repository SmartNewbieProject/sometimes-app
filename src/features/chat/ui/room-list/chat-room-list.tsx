import useLiked from "@/src/features/like/hooks/use-liked";
import { LegendList } from "@legendapp/list";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSocketEventManager } from "../../hooks/use-socket-event-manager";
import { useChatRoomList } from "../../queries/use-chat-room-list";
import type { Chat } from "../../types/chat";
import type { ChatRoomList as ChatRoomListType } from "../../types/chat";
import { updateChatRoomOnNewMessage } from "../../utils/update-chat-room-cache";
import ChatSearch from "../chat-search";
import ChatLikeCollapse from "./chat-like-collapse";
import ChatRoomCard from "./chat-room-card";

function ChatRoomList() {
  const { showCollapse } = useLiked();
  const collapse = showCollapse();
  const [keyword, setKeyword] = useState("");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatRoomList();
  const { subscribe } = useSocketEventManager();
  const queryClient = useQueryClient();
  const chatRooms = data?.pages.flatMap((page) => page.chatRooms) ?? [];

  const sortedChatRooms = [...chatRooms].sort((a, b) => {
    return new Date(b.recentDate).getTime() - new Date(a.recentDate).getTime();
  });

  const filteredData = sortedChatRooms.filter((item) => {
    return item.nickName.includes(keyword);
  });

  useEffect(() => {
    const unsubscribe = subscribe("newMessage", (chat: Chat) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      queryClient.setQueryData(["chat-room"], (oldData: any) =>
        updateChatRoomOnNewMessage(oldData, chat)
      );
    });

    return unsubscribe;
  }, [subscribe, queryClient]);

  return (
    <ScrollView>
      {collapse && (
        <ChatLikeCollapse type={collapse.type} collapse={collapse.data} />
      )}
      <View style={{ height: 18 }} />
      <ChatSearch keyword={keyword} setKeyword={setKeyword} />
      {filteredData.length > 0 &&
        (Platform.OS === "web" ? (
          <FlashList
            data={filteredData}
            style={{ flex: 1 }}
            estimatedItemSize={80}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            ListFooterComponent={<View style={{ height: 12 }} />}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatRoomCard item={item} />}
          />
        ) : (
          <LegendList
            data={filteredData}
            estimatedItemSize={80}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            ListFooterComponent={<View style={{ height: 12 }} />}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatRoomCard item={item} />}
            recycleItems
          />
        ))}
    </ScrollView>
  );
}

export default ChatRoomList;
