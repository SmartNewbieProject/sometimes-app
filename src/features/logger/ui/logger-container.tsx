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

  const handleClose = () => {
    setVisible(false);
  };
  const secretGesture = Gesture.Tap()
    .minPointers(3)
    .onEnd(() => {
      runOnJS(setVisible)(true);
    });

  return (
    <GestureDetector gesture={secretGesture}>
      <View style={{ flex: 1 }}>
        {children}
        <LoggerOverlay isVisible={isVisible} onClose={handleClose} />
      </View>
    </GestureDetector>
  );
}

export default LoggerContainer;
