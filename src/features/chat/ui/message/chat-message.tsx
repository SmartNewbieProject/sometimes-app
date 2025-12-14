import ReadCheckIcon from "@assets/icons/read-check.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import UnreadCheckIcon from "@assets/icons/unread-check.svg";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import useChatRoomDetail from "../../queries/use-chat-room-detail";
import type { Chat } from "../../types/chat";
import { formatToAmPm } from "../../utils/time";
import ChatBalloon from "./chat-balloon";
import ChatProfileImage from "./chat-profile-image";

interface ChatMessageProps {
  item: Chat;
  profileImage: string;
}

function ChatMessage({ item, profileImage }: ChatMessageProps) {
  const { data } = useChatRoomDetail(item.chatRoomId);
  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: item.isMe ? "row-reverse" : "row",
        },
      ]}
    >
      {!item.isMe && (
        <Link href={`/partner/view/${data?.matchId}`}>
          <ChatProfileImage imageUri={profileImage} size={32} />
        </Link>
      )}
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
          uploadStatus={item.uploadStatus}
        />
        <View
          style={[
            styles.infoContainer,
            { flexDirection: item.isMe ? "row-reverse" : "row" },
          ]}
        >
          <Text style={styles.time}>{formatToAmPm(item.createdAt)}</Text>

          {item.isMe && item.isRead && (
            <Text style={styles.readText}>읽음</Text>
          )}
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
    color: semanticColors.text.disabled,
    fontSize: 12,
    lineHeight: 17,
  },
  infoContainer: {
    gap: 5,

    alignItems: "center",
    flexDirection: "row",
  },
  readText: {
    color: semanticColors.text.disabled,
    fontSize: 12,
    lineHeight: 17,
  },
});

export default ChatMessage;
