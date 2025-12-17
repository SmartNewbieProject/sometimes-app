import { semanticColors } from '@/src/shared/constants/semantic-colors';
import {
  getRemainingTimeFormatted,
  getRemainingTimeLimit,
} from "@/src/shared/utils/like";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface MockTimeProps {
  matchExpiredAt: string;
}

function MockTime({ matchExpiredAt }: MockTimeProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();

    return () => anim.stop();
  }, [opacity]);
  return (
    <Animated.Text
      style={[
        styles.status,
        styles.timeText,
        getRemainingTimeLimit(matchExpiredAt) && {
          color: "#EF4444",
          opacity,
        },
      ]}
    >
      {getRemainingTimeFormatted(matchExpiredAt, true)}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  status: {
    lineHeight: 16,
    marginBottom: 5,
  },
  timeText: {
    fontSize: 11,
    color: semanticColors.text.disabled,
    lineHeight: 14,
    marginTop: 2,
    fontWeight: "500",
  },
});

export default MockTime;
