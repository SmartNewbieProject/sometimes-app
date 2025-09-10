import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import useChatList from "../../queries/use-chat-list";
import useChatRoomDetail from "../../queries/use-chat-room-detail";
import { useChatStore } from "../../store/chat";
import type { Chat } from "../../types/chat";
import ChatMessage from "../../ui/message/chat-message";
import DateDivider from "../../ui/message/date-divider";
import SystemMessage from "../../ui/message/system-message";
import { useChatEvent } from "../use-chat-event";
import useRefinedChatList from "../use-chat-list";
import { useChatRoomLifecycle } from "../use-chat-room-lifecycle";
import { useChatRoomRead } from "../use-chat-room-read";
import { useOptimisticChat } from "../use-optimistic-chat";
import { useSocketEventManager } from "../use-socket-event-manager";

type ChatListItem =
  | { type: "message"; data: Chat }
  | { type: "date"; data: { date: string; id: string } };

function useFacadeChatList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chatList } = useRefinedChatList();
  const { data: roomDetail } = useChatRoomDetail(id);
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = useChatList(id);
  const { actions } = useChatEvent();
  const { connected } = useChatStore();
  const { markRoomAsRead } = useChatRoomRead();
  const { subscribe } = useSocketEventManager();
  const { addReceivedMessage, updateImageUrl } = useOptimisticChat({
    chatRoomId: id,
  });

  useEffect(() => {
    const unsubscribe = subscribe(
      "imageUploadStatus",
      (uploadData: {
        id: string;
        chatRoomId: string;
        mediaUrl?: string;
        uploadStatus: "uploading" | "completed" | "failed";
      }) => {
        if (
          uploadData.chatRoomId === id &&
          uploadData.uploadStatus === "completed" &&
          uploadData.mediaUrl
        ) {
          updateImageUrl(uploadData.id, uploadData.mediaUrl);
        }
      }
    );
    return unsubscribe;
  }, [subscribe, id, updateImageUrl]);

  useEffect(() => {
    const unsubscribe = subscribe("messageUpdated", (uploadData) => {
      console.log("messageUpdated event received:", uploadData);
      updateImageUrl(uploadData.id, uploadData.mediaUrl ?? "");
    });

    return unsubscribe;
  }, [subscribe, id, updateImageUrl]);

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

  const sortedChatList = useMemo(() => {
    const sorted = [...chatList]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .reverse();
    return sorted;
  }, [chatList]);

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

  return {
    renderItem,
    chatListWithDateDividers,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

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

export default useFacadeChatList;
