import ReadCheckIcon from "@assets/icons/read-check.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import UnreadCheckIcon from "@assets/icons/unread-check.svg";
import { Link } from "expo-router";
import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import useChatRoomDetail from "../../queries/use-chat-room-detail";
import { chatEventBus } from "../../services/chat-event-bus";
import type { Chat } from "../../types/chat";
import { formatToAmPm } from "../../utils/time";
import ChatBalloon from "./chat-balloon";
import ChatProfileImage from "./chat-profile-image";
import { useTranslation } from "react-i18next";

interface ChatMessageProps {
  item: Chat;
  profileImage: string;
}

function ChatMessage({ item, profileImage }: ChatMessageProps) {
  const { t } = useTranslation();
  const { data } = useChatRoomDetail(item.chatRoomId);
  const isSending = item.sendingStatus === "sending";
  const isFailed = item.sendingStatus === "failed";

  const handleRetry = useCallback(() => {
    if (!isFailed || !data?.partnerId) return;

    chatEventBus.emit({
      type: "MESSAGE_RETRY_REQUESTED",
      payload: {
        message: item,
        to: data.partnerId,
      },
    });
  }, [isFailed, item, data?.partnerId]);

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
        <Pressable
          style={styles.balloonRow}
          onPress={isFailed ? handleRetry : undefined}
          disabled={!isFailed}
        >
          {item.isMe && isSending && (
            <View style={styles.sendingIndicator}>
              <ActivityIndicator size="small" color={semanticColors.text.disabled} />
            </View>
          )}
          {item.isMe && isFailed && (
            <View style={styles.failedIndicator}>
              <Text style={styles.failedText}>!</Text>
            </View>
          )}
          <ChatBalloon
            mediaUrl={item.mediaUrl}
            isMe={item.isMe}
            message={item.content}
            uploadStatus={item.uploadStatus}
          />
        </Pressable>
        <View
          style={[
            styles.infoContainer,
            { flexDirection: item.isMe ? "row-reverse" : "row" },
          ]}
        >
          {isFailed ? (
            <Text style={styles.failedStatusText}>{t('features.chat.ui.message.send_failed')}</Text>
          ) : (
            <Text style={styles.time}>{formatToAmPm(item.createdAt)}</Text>
          )}

          {item.isMe && item.isRead && !isSending && !isFailed && (
            <Text style={styles.readText}>{t('features.chat.ui.message.read')}</Text>
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
    flexShrink: 1,
    maxWidth: "80%",
  },
  balloonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sendingIndicator: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  failedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  failedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  failedStatusText: {
    color: "#FF3B30",
    fontSize: 12,
    lineHeight: 17,
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
