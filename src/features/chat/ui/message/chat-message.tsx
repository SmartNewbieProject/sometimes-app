import ReadCheckIcon from "@assets/icons/read-check.svg";
import UnreadCheckIcon from "@assets/icons/unread-check.svg";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Chat } from "../../types/chat";
import { formatToAmPm } from "../../utils/time";
import ChatBalloon from "./chat-balloon";
import ChatProfileImage from "./chat-profile-image";

interface ChatMessageProps {
  item: Chat;
  profileImage: string;
}

function ChatMessage({ item, profileImage }: ChatMessageProps) {
  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: item.isMe ? "row-reverse" : "row",
        },
      ]}
    >
      {!item.isMe && <ChatProfileImage imageUri={profileImage} size={32} />}
      <View
        style={[
          styles.balloonContainer,
          { alignItems: item.isMe ? "flex-end" : "flex-start" },
        ]}
      >
        <ChatBalloon
          mediaUrl={item.mediaUrl}
          isMe={item.isMe}
          message={item.content}
        />
        <View
          style={[
            styles.infoContainer,
            { flexDirection: item.isMe ? "row-reverse" : "row" },
          ]}
        >
          {item.isMe && (item.isRead ? <ReadCheckIcon /> : <UnreadCheckIcon />)}
          <Text style={styles.time}>{formatToAmPm(item.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 10,
    alignItems: "flex-start",
  },
  balloonContainer: {
    gap: 5,
    flex: 1,
  },
  time: {
    color: "#9A93AA",
    fontSize: 12,
    lineHeight: 17,
  },
  infoContainer: {
    gap: 5,

    alignItems: "center",
    flexDirection: "row",
  },
});

export default ChatMessage;
