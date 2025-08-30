import { Image } from "expo-image";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface ChatBalloonProps {
  message: string;
  isMe: boolean;
  mediaUrl?: string;
}

function ChatBalloon({ message, mediaUrl, isMe }: ChatBalloonProps) {
  console.log("mediaUrl", mediaUrl);
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: mediaUrl ? "transparent" : isMe ? "#7A4AE1" : "#fff",
          borderTopRightRadius: isMe ? 6 : 18,
          borderTopLeftRadius: !isMe ? 6 : 18,
        },
      ]}
    >
      {mediaUrl ? (
        <Image source={mediaUrl} style={styles.image} />
      ) : (
        <Text style={[styles.messageText, { color: isMe ? "#fff" : "#000" }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "70%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },

      android: {
        elevation: 3,
      },
    }),
  },
  messageText: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 21,
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 12,
  },
});

export default ChatBalloon;
