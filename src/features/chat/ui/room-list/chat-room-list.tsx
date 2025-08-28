import useLiked from "@/src/features/like/hooks/use-liked";
import { LegendList } from "@legendapp/list";
import { FlashList } from "@shopify/flash-list";
import type React from "react";
import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChatRoomList } from "../../queries/use-chat-room-list";
import type { ChatRoomList as ChatRoomListType } from "../../types/chat";
import ChatSearch from "../chat-search";
import ChatLikeCollapse from "./chat-like-collapse";
import ChatRoomCard from "./chat-room-card";

function ChatRoomList() {
  const { showCollapse } = useLiked();
  const insets = useSafeAreaInsets();
  const collapse = showCollapse();
  const [keyword, setKeyword] = useState("");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatRoomList();
  const chatRooms = data?.pages.flatMap((page) => page.chatRooms) ?? [];

  console.log("data", data);
  const filteredData = chatRooms.filter((item) => {
    return item.nickName.includes(keyword);
  });
  return (
    <View>
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
            ListHeaderComponent={
              <>
                {collapse && (
                  <ChatLikeCollapse
                    type={collapse.type}
                    collapse={collapse.data}
                  />
                )}
                <View style={{ height: 18 }} />
                <ChatSearch keyword={keyword} setKeyword={setKeyword} />
              </>
            }
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
            ListHeaderComponent={
              <>
                {collapse && (
                  <ChatLikeCollapse
                    type={collapse.type}
                    collapse={collapse.data}
                  />
                )}
                <View style={{ height: 18 }} />
                <ChatSearch keyword={keyword} setKeyword={setKeyword} />
              </>
            }
            ListFooterComponent={<View style={{ height: 12 }} />}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatRoomCard item={item} />}
            recycleItems
          />
        ))}
    </View>
  );
}

export default ChatRoomList;
