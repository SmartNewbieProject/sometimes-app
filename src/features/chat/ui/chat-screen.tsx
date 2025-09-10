import { useState } from "react";
import { Platform, View } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useRefinedChatList from "../hooks/use-chat-list";
import useChatList from "../queries/use-chat-list";
import ChatGuideBanner from "./chat-guide-banner";
import ChatList from "./chat-list";
import ChatRoomHeader from "./chat-room-header";
import GalleryList from "./gallery-list";
import ChatInput from "./input";
import WebChatInput from "./input.web";
import DateDivider from "./message/date-divider";
import NewMatchBanner from "./new-match-banner";

function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [isPhotoClicked, setPhotoClicked] = useState(false);

  const { chatList } = useRefinedChatList();
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const date = `${year}년 ${month}월 ${day}일`;
  const keyboard = useAnimatedKeyboard();

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          Platform.OS === "android"
            ? 0
            : -keyboard.height.value + insets.bottom - 10,
      },
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
            backgroundColor: "#FAFAFA",
            alignContent: "center",
            justifyContent: "center",
          },
          animatedStyles,
        ]}
      >
        {chatList.length < 3 && (
          <>
            {chatList.length < 1 && (
              <>
                <View style={{ height: 15 }} />
                <DateDivider date={date} />
              </>
            )}
            <View style={{ height: 15 }} />
            <NewMatchBanner />
            <View style={{ height: 15 }} />
            <ChatGuideBanner />
          </>
        )}
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
