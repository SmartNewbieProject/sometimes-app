import { BottomNavigation } from "@/src/shared/ui";
import { semanticColors } from '../../../shared/constants/colors';
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatHeader from "./chat-header";
import ChatRoomList from "./room-list/chat-room-list";

function Chat() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: semanticColors.surface.background,
        flex: 1,
        paddingTop: insets.top,
        position: "relative",
      }}
    >
      <ChatHeader />

      <View style={{ flex: 1 }}>
        <ChatRoomList />
      </View>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({});

export default Chat;
