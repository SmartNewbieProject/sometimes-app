import React from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

function ChatInput() {
  return <TextInput style={styles.textInput} placeholder="입력 창" />;
}

const styles = StyleSheet.create({
  textInput: {
    width: "95%",
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#d8d8d8",
    backgroundColor: "#fff",
    padding: 8,
    alignSelf: "center",
    marginBottom: 8,
  },
});

export default ChatInput;
