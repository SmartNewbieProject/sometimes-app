import React from "react";
import { StyleSheet, View } from "react-native";
import ChatBalloon from "./chat-balloon";

function ChatMessage() {
  return (
    <View>
      <ChatBalloon
        isMe
        message="개미는 뚠뚠 오늘도 뚠뚠 열심히 일을 하네 뚠뚠"
      />
    </View>
  );
}

const styles = StyleSheet.create({});

export default ChatMessage;
