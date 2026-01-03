import useLiked from "@/src/features/like/hooks/use-liked";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Show } from "@/src/shared/ui";
import { Image } from "expo-image";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import useChatRoomList from "../../hooks/use-chat-room-list";

import ChatSearch from "../chat-search";
import ChatLikeCollapse from "./chat-like-collapse";
import ChatRoomCard from "./chat-room-card";

function ChatRoomList() {
  const { t } = useTranslation();
  const { showCollapse } = useLiked();
  const collapse = showCollapse();
  const [keyword, setKeyword] = useState("");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useChatRoomList({ keyword });

  const openChatRooms = data.open;
  const lockChatRooms = data.lock;

  const isFetchingRef = useRef(false);
  const lastTriggerPosition = useRef(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const currentPosition = contentOffset.y;
      const isNearBottom = layoutMeasurement.height + currentPosition >= contentSize.height - 200;

      if (
        isNearBottom &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetchingRef.current &&
        currentPosition > lastTriggerPosition.current
      ) {
        isFetchingRef.current = true;
        lastTriggerPosition.current = currentPosition;

        fetchNextPage().finally(() => {
          isFetchingRef.current = false;
        });
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={400}>
      {collapse && (
        <ChatLikeCollapse type={collapse.type} collapse={collapse.data} />
      )}
      <View style={{ height: 18 }} />
      <ChatSearch keyword={keyword} setKeyword={setKeyword} />

      <Show when={isLoading}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={semanticColors.brand.primary} />
        </View>
      </Show>

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
          <Text style={styles.infoText}>{t('features.chat.ui.chat_room_list.no_chat_title')}</Text>
          <Text style={styles.infoText}>
            {t('features.chat.ui.chat_room_list.no_chat_subtitle')}
          </Text>
        </View>
      </Show>
      <Show when={!isLoading && lockChatRooms.length > 0}>
        <View style={styles.lockContainer}>
          <Text style={styles.lockTitleText}>
            {t('features.chat.ui.chat_room_list.new_match_notice')}
          </Text>
          {lockChatRooms.map((item) => (
            <ChatRoomCard key={item.id} item={item} />
          ))}
        </View>
      </Show>
      <Show when={!isLoading && openChatRooms.length > 0}>
        <View style={styles.openContainer}>
          <Text style={styles.openTitleText}>{t('features.chat.ui.chat_room_list.recent_chat')}</Text>
          {openChatRooms.map((item) => (
            <ChatRoomCard key={item.id} item={item} />
          ))}
        </View>
      </Show>
      <Show when={isFetchingNextPage}>
        <View style={styles.fetchingMoreContainer}>
          <ActivityIndicator size="small" color={semanticColors.brand.primary} />
        </View>
      </Show>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  fetchingMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  infoText: {
    color: semanticColors.text.disabled,
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
