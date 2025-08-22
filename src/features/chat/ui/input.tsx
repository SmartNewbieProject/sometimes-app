import PlusIcon from "@assets/icons/plus.svg";
import SendChatIcon from "@assets/icons/send-chat.svg";
import React from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
function ChatInput() {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width: width }]}>
      <View style={styles.photoButton}>
        <PlusIcon />
      </View>
      <TextInput
        multiline={true}
        numberOfLines={3}
        style={styles.textInput}
        placeholder="메세지를 입력하세요"
      />
      <Pressable style={styles.send}>
        <SendChatIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    minHeight: 47,
    maxHeight: 83,
    borderRadius: 24,
    marginLeft: 12,
    marginRight: 4,
    paddingVertical: 14,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.042,
    color: "#1E2229",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
  },
  container: {
    minHeight: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingVertical: 12,

    paddingHorizontal: 16,
    alignItems: "center",
  },
  photoButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    backgroundColor: "#F3EDFF",
  },
  send: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    textAlignVertical: "top",
    backgroundColor: "#7A4AE1",
  },
});

export default ChatInput;
