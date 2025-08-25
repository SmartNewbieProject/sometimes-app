import React, { useEffect, useRef, useState } from "react";
import { FlatList, Platform, type ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GalleryList from "./gallery-list";
import ChatInput from "./input";
import WebChatInput from "./input.web";

function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [isPhotoClicked, setPhotoClicked] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollToEnd = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };
  const keyboard = useAnimatedKeyboard();

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: Platform.OS === "android" ? 0 : -keyboard.height.value },
    ],
  }));

  useEffect(() => {
    scrollToEnd();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <Animated.View
        style={[
          { flex: 1, alignContent: "center", justifyContent: "center" },
          animatedStyles,
        ]}
      >
        <MyFlatList />

        {Platform.OS === "web" ? (
          <WebChatInput />
        ) : (
          <ChatInput
            isPhotoClicked={isPhotoClicked}
            setPhotoClicked={setPhotoClicked}
          />
        )}
        {isPhotoClicked && <GalleryList />}
      </Animated.View>
    </View>
  );
}

export default ChatScreen;

const data = [
  { id: "1", text: "안녕하세요 감사해요 잘있어요 다시만나요1" },
  { id: "2", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "3", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "4", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "5", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "6", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "7", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "8", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "9", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "10", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "11", text: "잘있어요 다시만나요1" },
  { id: "12", text: "잘있어요 다시만나요2" },
  { id: "13", text: "잘있어요 다시만나요3" },
  { id: "14", text: "잘있어요 다시만나요4" },
  { id: "15", text: "잘있어요 다시만나요5" },
  { id: "16", text: "잘있어요 다시만나요6" },
  { id: "17", text: "잘있어요 다시만나요7" },
];

const renderItem = ({ item }: { item: { text: string } }) => (
  <Text style={{ height: 80 }}>{item.text}</Text>
);

// FlatList 컴포넌트
const MyFlatList = () => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingHorizontal: 10,
        gap: 10,
      }}
      automaticallyAdjustContentInsets={false}
      inverted={true}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="never"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 80,
      }}
      automaticallyAdjustKeyboardInsets={true}
    />
  );
};
