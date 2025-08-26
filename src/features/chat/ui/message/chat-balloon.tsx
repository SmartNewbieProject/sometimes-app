import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ChatBalloonProps {
  message: string;
  isImage?: boolean;
  isMe: boolean;
}

function ChatBalloon({ message, isImage, isMe }: ChatBalloonProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isMe ? "#7A4AE1" : "#fff",
          borderTopRightRadius: isMe ? 6 : 18,
          borderTopLeftRadius: !isMe ? 6 : 18,
        },
      ]}
    >
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "22%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 21,
    color: "#fff",
  },
});

export default ChatBalloon;
