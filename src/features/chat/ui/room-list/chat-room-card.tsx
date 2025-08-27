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
      <View style={styles.rightContainer}>
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
          {item.unreadCount > 0 ? (
            <View style={styles.unreadCount}>
              <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
            </View>
          ) : (
            <View
              style={[styles.unreadCount, { backgroundColor: "transparent" }]}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    paddingTop: 8,

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
    alignItems: "flex-end",
  },
  timeText: {
    color: "#A2A2A2",
    fontSize: 13,
    lineHeight: 24,
  },
  unreadCount: {
    height: 24,
    minWidth: 24,

    borderRadius: 12,

    paddingHorizontal: 8,

    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7A4AE2",
  },
  unreadCountText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    height: 12,
    color: "#fff",
  },
  rightContainer: {
    flexDirection: "row",
    paddingTop: 2,
    flex: 1,
    alignItems: "center",
    gap: 8,
    borderBottomColor: "#F0F0F0",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
});

export default ChatRoomCard;
