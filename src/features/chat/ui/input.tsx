import PlusIcon from "@assets/icons/plus.svg";
import SendChatIcon from "@assets/icons/send-chat.svg";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useChatEvent } from "../hooks/use-chat-event";
import useChatRoomDetail from "../queries/use-chat-room-detail";
import type { Chat } from "../types/chat";

interface ChatInputProps {
  isPhotoClicked: boolean;
  setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChatInput({ isPhotoClicked, setPhotoClicked }: ChatInputProps) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: partner } = useChatRoomDetail(id);
  const queryClient = useQueryClient();

  const onConnected = useCallback(({ userId }: { userId: string }) => {
    console.log("연결됨:", userId);
  }, []);

  const onNewMessage = useCallback((msg: Chat) => {
    console.log("새 메시지:", msg);
  }, []);

  const chatOptions = useMemo(
    () => ({
      baseUrl:
        process.env.EXPO_PUBLIC_API_URL ?? "https://api.some-in-univ.com/api",
      autoConnect: true,
      onConnected: onConnected,
      onNewMessage: onNewMessage,
    }),
    [onConnected, onNewMessage]
  );

  const { actions, socket } = useChatEvent(chatOptions);


  const { width } = useWindowDimensions();
  const [chat, setChat] = useState("");
  const rotate = useSharedValue(0);
  const handlePhotoButton = () => {
    setTimeout(() => {
      setPhotoClicked((prev) => !prev);
    }, 400);
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (isPhotoClicked) {
      rotate.value = withTiming(45, {
        duration: 150,
      });
    } else {
      rotate.value = withTiming(0, {
        duration: 150,
      });
    }
  }, [isPhotoClicked]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
  const keyboard = useAnimatedKeyboard();

  const animatedKeyboardStyles = useAnimatedStyle(() => ({
    paddingBottom:
      Platform.OS === "android" && keyboard.height.value > 0 ? 16 : 0,
  }));

  const handleSend = () => {
    if (chat === "" || !partner?.partnerId) {
      return;
    }

    actions.sendMessage({
      chatRoomId: id,
      content: chat ?? "",
      to: partner?.partnerId,
    });
    setChat("");
    queryClient.refetchQueries({ queryKey: ["chat-list", id] });
  };

  return (
    <Animated.View
      style={[styles.container, { width: width }, animatedKeyboardStyles]}
    >
      <Pressable onPress={handlePhotoButton} style={styles.photoButton}>
        <Animated.View style={animatedStyles}>
          <PlusIcon />
        </Animated.View>
      </Pressable>
      <View style={styles.inputContainer}>
        <TextInput
          multiline={true}
          value={chat}
          editable={!isPhotoClicked}
          onChangeText={(text) => setChat(text)}
          style={styles.textInput}
          placeholder="메세지를 입력하세요"
          numberOfLines={3}
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
    marginLeft: 12,
    marginRight: 4,
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
  photoButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    backgroundColor: "#F3EDFF",
  },
  send: {
    width: 32,
    marginVertical: 8,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    alignSelf: "flex-end",
    textAlignVertical: "top",
    backgroundColor: "#7A4AE1",
  },
});

export default ChatInput;
