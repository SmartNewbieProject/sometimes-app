import SendChatIcon from "@assets/icons/send-chat.svg";
import type React from "react";
import { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";

interface SomemateInputProps {
  onSend?: (message: string) => void;
}

export function SomemateInput({ onSend }: SomemateInputProps) {
  const [chat, setChat] = useState("");

  const keyboard = useAnimatedKeyboard();

  const animatedKeyboardStyles = useAnimatedStyle(() => ({
    paddingBottom:
      Platform.OS === "android" && keyboard.height.value > 0 ? 16 : 0,
  }));

  const handleSend = useCallback(async () => {
    if (chat === "") {
      return;
    }

    const messageContent = chat.trim();
    setChat("");

    if (onSend) {
      onSend(messageContent);
    }
  }, [chat, onSend]);

  return (
    <Animated.View
      style={[styles.container, animatedKeyboardStyles]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          multiline={true}
          value={chat}
          editable={true}
          onChangeText={(text) => setChat(text)}
          style={styles.textInput}
          placeholder="메세지를 입력하세요"
        />
        {chat !== "" ? (
          <Pressable onPress={handleSend} style={styles.send}>
            <SendChatIcon width={32} height={32} />
          </Pressable>
        ) : (
          <View style={{ width: 32, height: 32 }} />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    alignSelf: "center",
    fontSize: 16,
    lineHeight: 18,
    marginVertical: 14,
    letterSpacing: -0.042,
    paddingHorizontal: 10,
    ...(Platform.OS === "android"
      ? { textAlignVertical: "center" }
      : { paddingVertical: 0 }),
    color: "#1E2229",
  },
  inputContainer: {
    flex: 1,
    minHeight: 47,
    maxHeight: 108,
    position: "relative",
    flexDirection: "row",

    alignItems: "center",
    borderRadius: 24,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 8,
  },
  container: {
    minHeight: 70,
    alignItems: "center",
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  send: {
    width: 32,
    marginVertical: 12,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    alignSelf: "flex-end",
    textAlignVertical: "top",
    backgroundColor: "#7A4AE1",
  },
});

export default SomemateInput;

