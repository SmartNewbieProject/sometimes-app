import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import useChatList from "../queries/use-chat-list";
import type { Chat } from "../types/chat";

function useRefinedChatList() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = useChatList(id);

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

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const date = `${year}년 ${month}월 ${day}일`;
  return {
    date,
    chatList: formattedChatList,
  };
}

export default useRefinedChatList;
