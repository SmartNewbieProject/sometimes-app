import { useQueryClient } from "@tanstack/react-query"; // React Query v5 기준
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Keyboard, View } from "react-native";
import { useAuth } from "../../auth";
import { useChatEvent } from "../hooks/use-chat-event";
import { useChatRoomLifecycle } from "../hooks/use-chat-room-lifecycle";
import { useChatRoomRead } from "../hooks/use-chat-room-read";
import useChatList from "../queries/use-chat-list";
import useChatRoomDetail from "../queries/use-chat-room-detail";
import { useChatStore } from "../store/chat";
import type { Chat } from "../types/chat";
import ChatMessage from "./message/chat-message";
import DateDivider from "./message/date-divider";
import SystemMessage from "./message/system-message";
import NewMatchBanner from "./new-match-banner";
import {logger} from "@shared/libs";

// useChatList 훅의 반환 타입 (가정)
interface PaginatedChatData {
  pages: { messages: Chat[] }[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  pageParams: any[];
}

type ChatListItem =
  | { type: "message"; data: Chat }
  | { type: "date"; data: { date: string; id: string } };
interface ChatListProps {
  setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatList = ({ setPhotoClicked }: ChatListProps) => {
  const { accessToken } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [forceUpdate, setForceUpdate] = useState(0);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatList(id);
  const { data: roomDetail } = useChatRoomDetail(id);

  const chatList = data?.pages.flatMap((page) => page.messages) ?? [];
  
  const onConnected = useCallback(({ userId }: { userId: string }) => {
    console.log("연결됨2:", userId);
  }, []);

  const onNewMessage = useCallback(
    (newMessage: Chat) => {
      console.log("새 메시지2:", newMessage);
      const queryKey = ["chat-list", id];
      const currentData = queryClient.getQueryData<PaginatedChatData>(queryKey);
      if (
        currentData?.pages[0]?.messages.some((msg) => msg.id === newMessage.id)
      ) {
        return;
      }
      queryClient.setQueryData<PaginatedChatData>(queryKey, (oldData) => {
        if (!oldData) {
          return {
            pages: [{ messages: [newMessage] }],
            pageParams: [undefined],
          };
        }
        const newData = {
          pages: oldData.pages.map((page, index) => 
            index === 0 
              ? { ...page, messages: [newMessage, ...page.messages] }
              : page
          ),
          pageParams: [...oldData.pageParams],
        };
        return newData;
      });

      setForceUpdate(prev => prev + 1);
      const { connected } = useChatStore.getState();
      if (connected) {
        actions.readMessages(id);
      }
    },
    [queryClient, id]
  );

  const onImageUploadStatus = useCallback(
    (payload: { id: string; chatRoomId: string; uploadStatus: 'uploading' | 'completed' | 'failed'; mediaUrl?: string }) => {
      const queryKey = ["chat-list", id];
      queryClient.setQueryData<PaginatedChatData>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        const newData = { ...oldData };
        newData.pages = newData.pages.map(page => ({
          ...page,
          messages: page.messages.map(msg => 
            msg.id === payload.id 
              ? { ...msg, uploadStatus: payload.uploadStatus, ...(payload.mediaUrl && { mediaUrl: payload.mediaUrl }) }
              : msg
          )
        }));
        return newData;
      });
    },
    [queryClient, id]
  );

  const chatOptions = useMemo(
    () => ({
      baseUrl:
        'http://localhost:8044' ?? "https://api.some-in-univ.com/api",
      onConnected: onConnected,
      onNewMessage: onNewMessage,
      onImageUploadStatus: onImageUploadStatus,
    }),
    [onConnected, onNewMessage, onImageUploadStatus]
  );

  const { actions, disconnect } = useChatEvent(chatOptions);
  const { connected } = useChatStore();
  const { markRoomAsRead } = useChatRoomRead();

  useChatRoomLifecycle({
    chatRoomId: id,
    actions,
    connected,
    disconnect,
  });

  useEffect(() => {
    if (connected) {
      actions.readMessages(id);
      markRoomAsRead(id);
    }
  }, [id, connected, markRoomAsRead]);

  const sortedChatList = useMemo(() => {
    const sorted = [...chatList]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .reverse();
    return sorted;
  }, [chatList, forceUpdate]);

  const chatListWithDateDividers = useMemo(() => {
    const items: ChatListItem[] = [];

    for (let i = 0; i < sortedChatList.length; i++) {
      const currentMessage = sortedChatList[i];
      const nextMessage = sortedChatList[i + 1];

      const currentDate = new Date(currentMessage.createdAt);
      const nextDate = nextMessage ? new Date(nextMessage.createdAt) : null;

      items.push({
        type: "message",
        data: currentMessage,
      });

      if (!nextDate || !isSameDay(currentDate, nextDate)) {
        items.push({
          type: "date",
          data: {
            date: formatDate(currentDate),
            id: `date-${currentDate.toDateString()}`,
          },
        });
      }
    }

    return items;
  }, [sortedChatList]);

  const renderItem = ({ item }: { item: ChatListItem }) => {
    if (item.type === "date") {
      return <DateDivider date={item.data.date} />;
    }
    if (item.data.messageType === "system") {
      return <SystemMessage item={item.data} />;
    }
    return (
      <ChatMessage
        profileImage={roomDetail?.partner.mainProfileImageUrl ?? ""}
        item={item.data}
      />
    );
  };

  const handlePress = () => {
    setTimeout(() => setPhotoClicked(false), 400);
    Keyboard.dismiss();
  };

  const scrollViewRef = useRef<FlatList<ChatListItem>>(null);

  console.log("check", chatListWithDateDividers);
  return (
    <FlatList
      data={chatListWithDateDividers}
      renderItem={renderItem}
      keyExtractor={(item) => item.data.id}
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
      ListFooterComponent={<View style={{ height: 20 }} />}
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

const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() === d2.getTime();
};
const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "오늘";
  }
  if (isSameDay(date, yesterday)) {
    return "어제";
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

export default ChatList;
