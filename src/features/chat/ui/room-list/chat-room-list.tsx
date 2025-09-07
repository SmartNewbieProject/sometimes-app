import useLiked from "@/src/features/like/hooks/use-liked";
import { Show } from "@/src/shared/ui";
import { LegendList } from "@legendapp/list";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
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
      if (!chat.chatRoomId || !chat.content) {
        console.warn("Invalid chat message received:", chat);
        return;
      }

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      queryClient.setQueryData(["chat-room"], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        return updateChatRoomOnNewMessage(oldData, chat);
      });

      queryClient.invalidateQueries({ queryKey: ["chat-room"] });
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, queryClient]);

  return (
    <ScrollView>
      {collapse && (
        <ChatLikeCollapse type={collapse.type} collapse={collapse.data} />
      )}
      <View style={{ height: 18 }} />
      <ChatSearch keyword={keyword} setKeyword={setKeyword} />

      <Show when={!isLoading && data?.pages.length === 0}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 36,
          }}
        >
          <Image
            style={{ width: 260, height: 260, marginBottom: 20 }}
            source={require("@assets/images/limit-age.png")}
          />
          <Text style={styles.infoText}>아직 열린 채팅방이 없어요</Text>
          <Text style={styles.infoText}>
            서로 좋아요가 되면 대화가 시작돼요
          </Text>
        </View>
      </Show>
      <Show when={filteredData.length > 0}>
        {Platform.OS === "web" ? (
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
        )}
      </Show>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoText: {
    color: "#353C46",
    fontSize: 14,
    marginTop: 4,
  },
});

export default ChatRoomList;
