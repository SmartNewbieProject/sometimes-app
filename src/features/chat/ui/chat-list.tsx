import { useQueryClient } from "@tanstack/react-query"; // React Query v5 기준
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { FlatList, Keyboard, View } from "react-native";
import { useAuth } from "../../auth";
import { useChatEvent } from "../hooks/use-chat-event";
import useChatList from "../queries/use-chat-list";
import type { Chat } from "../types/chat";
import ChatMessage from "./message/chat-message";
import NewMatchBanner from "./new-match-banner";

// useChatList 훅의 반환 타입 (가정)
interface PaginatedChatData {
  pages: { messages: Chat[] }[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  pageParams: any[];
}

interface ChatListProps {
  setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatList = ({ setPhotoClicked }: ChatListProps) => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatList(id);

  const chatList = data?.pages.flatMap((page) => page.messages) ?? [];

  const onConnected = useCallback(({ userId }: { userId: string }) => {
    console.log("연결됨2:", userId);
  }, []);

  const onNewMessage = useCallback(
    (newMessage: Chat) => {
      console.log("새 메시지2:", newMessage);
      const queryKey = ["chat", id];

      const currentData = queryClient.getQueryData<PaginatedChatData>(queryKey);
      if (
        currentData?.pages[0]?.messages.some((msg) => msg.id === newMessage.id)
      ) {
        console.log("이미 존재하는 아이템입니다.");
        return;
      }

      queryClient.setQueryData<PaginatedChatData>(queryKey, (oldData) => {
        if (!oldData) {
          return {
            pages: [{ messages: [newMessage] }],
            pageParams: [undefined],
          };
        }

        const newData = { ...oldData };

        newData.pages[0] = {
          ...newData.pages[0],
          messages: [newMessage, ...newData.pages[0].messages],
        };

        return newData;
      });

      actions.readMessages(id);
    },
    [queryClient, id]
  );

  const chatOptions = useMemo(
    () => ({
      baseUrl:
        process.env.EXPO_PUBLIC_API_URL ?? "https://api.some-in-univ.com/api",
      onConnected: onConnected,
      onNewMessage: onNewMessage,
    }),
    [onConnected, onNewMessage]
  );

  const { actions } = useChatEvent(chatOptions);

  useEffect(() => {
    actions.readMessages(id);
  }, [id]);

  const sortedChatList = useMemo(() => {
    return [...chatList]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .reverse();
  }, [chatList]);

  const handlePress = () => {
    setTimeout(() => setPhotoClicked(false), 400);
    Keyboard.dismiss();
  };

  const scrollViewRef = useRef<FlatList<Chat>>(null);

  return (
    <FlatList
      data={sortedChatList}
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
