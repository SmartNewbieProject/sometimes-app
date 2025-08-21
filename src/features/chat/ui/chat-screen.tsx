import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  type KeyboardEventListener,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PADDING_BOTTOM,
  useGradualAnimation,
} from "../hooks/use-gradual-animation";
import ChatInput from "./input";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function ChatScreen() {
  const { height } = useGradualAnimation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentOffsetY, setCurrentOffsetY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToEnd = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToEnd();
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      handleKeyboardShow
    );

    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      handleKeyboardHide
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [currentOffsetY, contentHeight, scrollViewHeight]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setCurrentOffsetY(contentOffset.y);
    setContentHeight(contentSize.height);
    setScrollViewHeight(layoutMeasurement.height);
  };

  const handleKeyboardHide: KeyboardEventListener = (event) => {
    const keyboardHeight = event?.endCoordinates?.height || 0;
    const newY = Math.max(0, currentOffsetY - keyboardHeight);
    scrollViewRef.current?.scrollTo({ y: newY, animated: false });
  };

  const handleKeyboardShow: KeyboardEventListener = (event) => {
    const keyboardHeight = event.endCoordinates.height;

    console.log(
      "check",
      currentOffsetY + keyboardHeight,
      contentHeight - scrollViewHeight
    );
    const newY = currentOffsetY + keyboardHeight;

    scrollViewRef.current?.scrollTo({
      y: newY,
      animated: false,
    });
  };

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
      marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  return (
    <View
      style={{
        flex: 1,
        position: "relative",
        paddingTop: insets.top,
        padding: 16,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={() => {
          setTimeout(() => scrollToEnd(), 50);
        }}
      >
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>
          안녕하세요 감사해요 잘있어요 다시만나요
        </Text>
        <Text style={{ height: 80 }}>잘있어요 다시만나요1</Text>
        <Text style={{ height: 80 }}>잘있어요 다시만나요2</Text>
        <Text style={{ height: 80 }}>잘있어요 다시만나요3</Text>
        <Text style={{ height: 80 }}>잘있어요 다시만나요4</Text>
        <Text style={{ height: 80 }}>잘있어요 다시만나요5</Text>
        <Text style={{ height: 80 }}>잘있어요 다시만나요6</Text>
        <Text style={{ height: 80 }}>잘있어요 다시만나요7</Text>

        <ChatInput />
      </ScrollView>
      <Animated.View style={fakeView} />
    </View>
  );
}

export default ChatScreen;
