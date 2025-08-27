import React from "react";
import { StyleSheet, View } from "react-native";
import type { ChatRoom } from "../../types/chat";
import ChatProfileImage from "../message/chat-profile-image";

interface ChatRoomCardProps {
  item: ChatRoom;
}

function ChatRoomCard({ item }: ChatRoomCardProps) {
  return (
    <View style={styles.container}>
      <ChatProfileImage size={55} imageUri={item.partner.profileImage} />
      <View style={contentContaienr}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
});

export default ChatRoomCard;
