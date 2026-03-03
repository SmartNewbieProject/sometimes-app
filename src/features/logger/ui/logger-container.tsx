import type React from "react";
import { useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import type { GestureResponderEvent } from "react-native";
import LoggerOverlay from "./logger-overlay";

interface LoggerContainerProps {
  children: React.ReactNode;
}

const ZONE_SIZE = 60;
const SEQUENCE_TIMEOUT = 4000;
const REQUIRED_SEQUENCE = ["top-left", "bottom-right", "top-left"] as const;
type Zone = (typeof REQUIRED_SEQUENCE)[number];

function LoggerContainer({ children }: LoggerContainerProps) {
  const [isVisible, setVisible] = useState(false);
  const sequenceRef = useRef({ index: 0, lastTapTime: 0 });
  const { width, height } = useWindowDimensions();

  const getZone = (x: number, y: number): Zone | null => {
    if (x <= ZONE_SIZE && y <= ZONE_SIZE) return "top-left";
    if (x >= width - ZONE_SIZE && y >= height - ZONE_SIZE)
      return "bottom-right";
    return null;
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    const now = Date.now();
    const seq = sequenceRef.current;

    if (seq.index > 0 && now - seq.lastTapTime > SEQUENCE_TIMEOUT) {
      seq.index = 0;
    }

    const zone = getZone(pageX, pageY);
    if (!zone) {
      seq.index = 0;
      return;
    }

    if (zone === REQUIRED_SEQUENCE[seq.index]) {
      seq.lastTapTime = now;
      seq.index += 1;

      if (seq.index >= REQUIRED_SEQUENCE.length) {
        seq.index = 0;
        setVisible(true);
      }
    } else if (zone === REQUIRED_SEQUENCE[0]) {
      seq.index = 1;
      seq.lastTapTime = now;
    } else {
      seq.index = 0;
    }
  };

  return (
    <View style={{ flex: 1 }} onTouchEnd={handleTouchEnd}>
      {children}
      <LoggerOverlay isVisible={isVisible} onClose={() => setVisible(false)} />
    </View>
  );
}

export default LoggerContainer;
