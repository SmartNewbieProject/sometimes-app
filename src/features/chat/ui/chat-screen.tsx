import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import {
  PADDING_BOTTOM,
  useGradualAnimation,
} from "../hooks/use-gradual-animation";
import ChatInput from "./input";

function CahtScreen() {
  const { height } = useGradualAnimation();

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
      marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
    };
  });
  return (
    <View style={{ flex: 1, position: "relative" }}>
      <View style={{ flex: 1 }}>
        <Text>안녕하세요 감사해요 잘있어요 다시만나요</Text>
        <Animated.View style={fakeView} />
      </View>

      <ChatInput />
    </View>
  );
}

const styles = StyleSheet.create({
  chatInputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default CahtScreen;
