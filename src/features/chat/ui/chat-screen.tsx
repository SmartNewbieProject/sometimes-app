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

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

function ChatScreen() {
  const { height } = useGradualAnimation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToEnd = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToEnd();
  }, []);

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
      marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  const chatScreen = useAnimatedStyle(() => {
    console.log("bottom", SCREEN_HEIGHT - height.value);

    return {
      height: SCREEN_HEIGHT - Math.abs(height.value),
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
        height: SCREEN_HEIGHT,
        paddingBottom: insets.bottom,
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
          },
          chatScreen,
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          scrollEventThrottle={16}
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
        </ScrollView>
      </Animated.View>
      <View
        style={[
          fakeView,
          { position: "absolute", bottom: 0, left: 0, right: 0 },
        ]}
      >
        <ChatInput />
        <Animated.View style={fakeView} />
      </View>
    </View>
  );
}

export default ChatScreen;
