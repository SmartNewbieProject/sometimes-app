import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  type ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatList from "./chat-list";
import ChatRoomHeader from "./chat-room-header";
import GalleryList from "./gallery-list";
import ChatInput from "./input";
import WebChatInput from "./input.web";

function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [isPhotoClicked, setPhotoClicked] = useState(false);

  const keyboard = useAnimatedKeyboard();

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: Platform.OS === "android" ? 0 : -keyboard.height.value },
    ],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top,
        width: "100%",
        paddingBottom: insets.bottom + 14,
      }}
    >
      <ChatRoomHeader />
      <Animated.View
        style={[
          {
            flex: 1,
            width: "100%",
            backgroundColor: "#fff",
            alignContent: "center",
            justifyContent: "center",
          },
          animatedStyles,
        ]}
      >
        <ChatList setPhotoClicked={setPhotoClicked} />

        {Platform.OS === "web" ? (
          <WebChatInput />
        ) : (
          <ChatInput
            isPhotoClicked={isPhotoClicked}
            setPhotoClicked={setPhotoClicked}
          />
        )}
        {isPhotoClicked && <GalleryList isPhotoClicked={isPhotoClicked} />}
      </Animated.View>
    </View>
  );
}

export default ChatScreen;
