import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Keyboard, View } from "react-native";
import { useChatEvent } from "../hooks/use-chat-event";
import { useChatRoomLifecycle } from "../hooks/use-chat-room-lifecycle";
import { useChatRoomRead } from "../hooks/use-chat-room-read";
import { useSocketEventManager } from "../hooks/use-socket-event-manager";
import { useOptimisticChat } from "../hooks/use-optimistic-chat";
import useChatList from "../queries/use-chat-list";
import useChatRoomDetail from "../queries/use-chat-room-detail";
import { useChatStore } from "../store/chat";
import type { Chat } from "../types/chat";
import ChatMessage from "./message/chat-message";
import DateDivider from "./message/date-divider";
import SystemMessage from "./message/system-message";

type ChatListItem =
  | { type: "message"; data: Chat }
  | { type: "date"; data: { date: string; id: string } };
interface ChatListProps {
  setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatList = ({ setPhotoClicked }: ChatListProps) => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [forceUpdate, setForceUpdate] = useState(0);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatList(id);
  const { data: roomDetail } = useChatRoomDetail(id);

  const chatList = data?.pages.flatMap((page) => page.messages) ?? [];
  const formattedChatList = chatList.map((chat) => {
    const date = new Date(chat.createdAt);

    date.setHours(date.getHours() - 9);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return {
      ...chat,
      createdAt: formattedDate,
    };
  });

  const { actions } = useChatEvent();
  const { connected } = useChatStore();
  const { markRoomAsRead } = useChatRoomRead();
  const { subscribe } = useSocketEventManager();
  const { addReceivedMessage, updateImageUrl } = useOptimisticChat({ chatRoomId: id });

  useChatRoomLifecycle({
    chatRoomId: id,
    actions,
    connected,
    disconnect: () => {}, // 전역 소켓이므로 로컬에서 disconnect 불필요
  });

  useEffect(() => {
    if (connected) {
      actions.readMessages(id);
      markRoomAsRead(id);
    }
  }, [id, connected, markRoomAsRead]);

  useEffect(() => {
    const unsubscribe = subscribe("newMessage", (chat: Chat) => {
      if (chat.chatRoomId === id) {
        actions.readMessages(id);
        addReceivedMessage(chat);
      }
    });

    return unsubscribe;
  }, [subscribe, id, addReceivedMessage, actions]);

  useEffect(() => {
    const unsubscribe = subscribe(
      "imageUploadStatus",
      (uploadData: {
        id: string;
        chatRoomId: string;
        mediaUrl?: string;
        uploadStatus: "uploading" | "completed" | "failed";
      }) => {
        if (uploadData.chatRoomId === id && uploadData.uploadStatus === "completed" && uploadData.mediaUrl) {
          updateImageUrl(uploadData.id, uploadData.mediaUrl);
        }
      }
    );
    return unsubscribe;
  }, [subscribe, id, updateImageUrl]);

  useEffect(() => {
    const unsubscribe = subscribe("messageUpdated", uploadData => {
      console.log('messageUpdated event received:', uploadData);
      updateImageUrl(uploadData.id, uploadData.mediaUrl ?? "");
    });

    return unsubscribe;
  }, [subscribe, id, updateImageUrl]);

  const sortedChatList = useMemo(() => {
    const sorted = [...formattedChatList]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .reverse();
    return sorted;
  }, [formattedChatList, forceUpdate]);

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
    console.log("data", item);
    if (item.type === "date") {
      return <DateDivider date={item.data.date} />;
    }
    if (item.data.senderId === "system") {
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
