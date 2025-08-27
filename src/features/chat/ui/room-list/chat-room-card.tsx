import { dayUtils } from "@/src/shared/libs";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ChatRoom } from "../../types/chat";
import ChatProfileImage from "../message/chat-profile-image";

interface ChatRoomCardProps {
  item: ChatRoom;
}

function ChatRoomCard({ item }: ChatRoomCardProps) {
  return (
    <View style={styles.container}>
      <ChatProfileImage size={55} imageUri={item.partner.profileImage} />
      <View style={styles.contentContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.partner.name}
        </Text>
        <Text style={styles.lastMessageText} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.timeText}>
          {dayUtils.formatRelativeTime(item.lastMessageAt)}
        </Text>
        <View style={styles.unreadCount}>
          <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
        </View>
      </View>
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
  contentContainer: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#000",
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
  },
  lastMessageText: {
    color: "#585858",
    fontSize: 14,
    lineHeight: 24,
  },
  infoContainer: {
    gap: 2,
  },
  timeText: {
    color: "#A2A2A2",
    fontSize: 13,
    lineHeight: 24,
  },
  unreadCount: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7A4AE2",
    borderRadius: 24,
  },
  unreadCountText: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "Pretendard-Bold",
    lineHeight: 18,
    color: "#fff",
  },
});

export default ChatRoomCard;
