import useLiked from "@/src/features/like/hooks/use-liked";
import { semanticColors } from '../../../../shared/constants/colors';
import { Show } from "@/src/shared/ui";
import { LegendList } from "@legendapp/list";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import useChatRoomList from "../../hooks/use-chat-room-list";
import { useSomemateEnabled } from "@/src/features/somemate/queries/use-somemate-enabled";

import ChatSearch from "../chat-search";
import ChatLikeCollapse from "./chat-like-collapse";
import ChatRoomCard from "./chat-room-card";
import SomemateBanner from "../somemate-banner";

function ChatRoomList() {
  const { showCollapse } = useLiked();
  const collapse = showCollapse();
  const [keyword, setKeyword] = useState("");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useChatRoomList({ keyword });
  const { data: somemateEnabled } = useSomemateEnabled();

  const openChatRooms = data.open;
  const lockChatRooms = data.lock;

  const canAccessSomemate = somemateEnabled?.enabled ?? false;

  return (
    <ScrollView>
      {collapse && (
        <ChatLikeCollapse type={collapse.type} collapse={collapse.data} />
      )}
      <View style={{ height: 18 }} />
      {canAccessSomemate && <SomemateBanner />}
      <ChatSearch keyword={keyword} setKeyword={setKeyword} />

      <Show
        when={
          !isLoading && openChatRooms.length === 0 && lockChatRooms.length === 0
        }
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 36,
          }}
        >
          <Image
            style={{ width: 216, height: 216, marginBottom: 20 }}
            source={require("@assets/images/no-chat-miho.png")}
          />
          <Text style={styles.infoText}>아직 열린 채팅방이 없어요</Text>
          <Text style={styles.infoText}>
            서로 좋아요가 되면 대화가 시작돼요
          </Text>
        </View>
      </Show>
      <Show when={lockChatRooms.length > 0}>
        <View style={styles.lockContainer}>
          <Text style={styles.lockTitleText}>
            새로운 마음이 도착했어요💜 채팅을 열고 메시지를 확인해보세요!
          </Text>
          {Platform.OS === "web" ? (
            <FlashList
              data={lockChatRooms}
              style={{ flex: 1 }}
              estimatedItemSize={80}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatRoomCard item={item} />}
            />
          ) : (
            <LegendList
              data={lockChatRooms}
              estimatedItemSize={80}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatRoomCard item={item} />}
              recycleItems
            />
          )}
        </View>
      </Show>
      <Show when={openChatRooms.length > 0}>
        <View style={styles.openContainer}>
          <Text style={styles.openTitleText}>최근 대화</Text>
          {Platform.OS === "web" ? (
            <FlashList
              data={openChatRooms}
              style={{ flex: 1 }}
              estimatedItemSize={80}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatRoomCard item={item} />}
            />
          ) : (
            <LegendList
              data={openChatRooms}
              estimatedItemSize={80}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatRoomCard item={item} />}
              recycleItems
            />
          )}
        </View>
      </Show>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoText: {
    color: semanticColors.text.inverse,
    fontSize: 18,
    lineHeight: 23,
    marginTop: 4,
  },
  lockTitleText: {
    color: semanticColors.brand.primary,
    fontSize: 12,
    fontWeight: 600,
    paddingHorizontal: 16,

    lineHeight: 18,
    fontFamily: "Pretendard-SemiBold",
  },
  lockContainer: {
    gap: 4,
    marginTop: 14,
  },
  openTitleText: {
    color: semanticColors.text.disabled,
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 18,
    fontFamily: "Pretendard-SemiBold",
  },
  openContainer: {
    gap: 4,
    marginTop: 14,
  },
});

export default ChatRoomList;
