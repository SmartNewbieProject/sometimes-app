import type React from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import LoggerOverlay from "./logger-overlay";

interface LoggerContainerProps {
  children: React.ReactNode;
}

function LoggerContainer({ children }: LoggerContainerProps) {
  const [isVisible, setVisible] = useState(false);

  const handleVisible = () => {
    setVisible(false);
  };
  const secretGesture = Gesture.LongPress()
    .numberOfPointers(3)

    .minDuration(1000)
    .onStart(() => {
      runOnJS(setVisible)(true);
    });

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={secretGesture}>
        <View style={{ flex: 1 }}>{children}</View>
      </GestureDetector>
      <LoggerOverlay isVisible={isVisible} onClose={handleVisible} />
    </View>
  );
}

export default LoggerContainer;
