import type React from "react";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoggerOverlay from "./logger-overlay";

interface LoggerContainerProps {
  children: React.ReactNode;
}

const SEQUENCE_TIMEOUT = 4000;
const REQUIRED_SEQUENCE = ["top-left", "bottom-right", "top-left"] as const;
type Zone = (typeof REQUIRED_SEQUENCE)[number];

function LoggerContainer({ children }: LoggerContainerProps) {
  const [isVisible, setVisible] = useState(false);
  const sequenceRef = useRef({ index: 0, lastTapTime: 0 });
  const insets = useSafeAreaInsets();

  const advanceSequence = (zone: Zone) => {
    const now = Date.now();
    const seq = sequenceRef.current;

    if (seq.index > 0 && now - seq.lastTapTime > SEQUENCE_TIMEOUT) {
      seq.index = 0;
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
    <View style={styles.root}>
      {children}
      {!isVisible && (
        <>
          <Pressable
            style={[styles.zone, styles.topLeft, { height: Math.max(insets.top, 20) }]}
            onPress={() => advanceSequence("top-left")}
          />
          <Pressable
            style={[styles.zone, styles.bottomRight, { height: Math.max(insets.bottom, 20) }]}
            onPress={() => advanceSequence("bottom-right")}
          />
        </>
      )}
      <LoggerOverlay isVisible={isVisible} onClose={() => setVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  zone: {
    position: "absolute",
    width: 100,
    zIndex: 9998,
  },
  topLeft: {
    left: 0,
    top: 0,
  },
  bottomRight: {
    right: 0,
    bottom: 0,
  },
});

export default LoggerContainer;
