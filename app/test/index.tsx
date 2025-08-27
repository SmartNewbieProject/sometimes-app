import Chat from "@/src/features/chat/ui/chat";
import ChatScreen from "@/src/features/chat/ui/chat-screen";
import GalleryList from "@/src/features/chat/ui/gallery-list";
import ChatRoomList from "@/src/features/chat/ui/room-list/chat-room-list";
import { DefaultLayout } from "@/src/features/layout/ui";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function Test() {
  return <Chat />;
}

const styles = StyleSheet.create({});

export default Test;
