import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";
export const PADDING_BOTTOM = 20;

export const useGradualAnimation = () => {
  const height = useSharedValue(PADDING_BOTTOM);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        height.value = Math.max(e.height, PADDING_BOTTOM);
      },
      onEnd: (e) => {
        "worklet";
        height.value = e.height;
      },
    },
    []
  );
  return { height };
};
