import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../../auth";
import { useChatEvent } from "../hooks/use-chat-event";
import useChatList from "../queries/use-chat-list";
import type { Chat } from "../types/chat";
import ChatMessage from "./message/chat-message";
import NewMatchBanner from "./new-match-banner";

interface ChatListProps {
  setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatList = ({ setPhotoClicked }: ChatListProps) => {
  const { accessToken } = useAuth();
  const [chatLists, setChatLists] = useState<Chat[]>([]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatList(id);
  const chatList = data?.pages.flatMap((page) => page.messages) ?? [];

  const onConnected = useCallback(({ userId }: { userId: string }) => {
    console.log("연결됨2  :", userId);
  }, []);

  useEffect(() => {
    console.log("chatList", chatList);
    setChatLists((prev) => {
      const existingIds = new Set(prev.map((chat) => chat.id));
      const newUniqueChats = chatList.filter(
        (chat) => !existingIds.has(chat.id)
      );

      console.log("check", newUniqueChats, prev);
      return [...prev, ...newUniqueChats];
    });
  }, [JSON.stringify(chatList)]);

  useEffect(() => {
    actions.readMessages(id);
  }, [JSON.stringify(chatLists), id]);

  const onNewMessage = useCallback((msg: Chat) => {
    console.log("새 메시지2:", msg);
    setChatLists((prevChatLists) => {
      const isDuplicate = prevChatLists.some((chat) => chat.id === msg.id);
      if (isDuplicate) {
        console.log("이미 존재하는 아이템입니다.");
        return prevChatLists;
      }

      return [...prevChatLists, msg];
    });
    actions.readMessages(id);
  }, []);

  console.log("check2", chatLists);

  const chatOptions = useMemo(
    () => ({
      baseUrl:
        process.env.EXPO_PUBLIC_API_URL ?? "https://api.some-in-univ.com/api",
      onConnected: onConnected,
      onNewMessage: onNewMessage,
    }),
    [onConnected, onNewMessage]
  );

  const { actions, socket } = useChatEvent(chatOptions);

  const handlePress = () => {
    setTimeout(() => {
      setPhotoClicked(false);
    }, 400);
    Keyboard.dismiss();
  };
  const scrollViewRef = useRef<FlatList<Chat>>(null);

  return (
    <FlatList
      data={[...chatLists].reverse()}
      renderItem={({ item }) => <ChatMessage item={item} />}
      keyExtractor={(item) => item.id}
      onTouchStart={handlePress}
      inverted
      style={{
        paddingHorizontal: 16,
        width: "100%",
        flex: 1,
      }}
      contentContainerStyle={{
        gap: 10,
        flexGrow: 1,
      }}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.7}
      ref={scrollViewRef}
      ListFooterComponent={
        <>
          <View style={{ height: 20 }} />
          <NewMatchBanner />
        </>
      }
      ListHeaderComponent={<View style={{ height: 20 }} />}
      automaticallyAdjustContentInsets={false}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="never"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 80,
      }}
      automaticallyAdjustKeyboardInsets={true}
    />
  );
};

export default ChatList;
