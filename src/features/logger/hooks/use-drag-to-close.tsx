import { useEffect } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface UseDragToCloseProps {
  onClose: () => void;
  isVisible: boolean;
}

export const useDragToClose = ({ onClose, isVisible }: UseDragToCloseProps) => {
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value.y + event.translationY);
    })
    .onEnd(() => {
      if (translateY.value > SCREEN_HEIGHT * 0.3) {
        translateY.value = withSpring(SCREEN_HEIGHT, { damping: 15 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, { duration: 0 });
    }
  }, [isVisible]);

  return { gesture, animatedStyle };
};
