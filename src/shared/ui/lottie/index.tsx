import { StyleSheet, View, type ViewStyle, StyleProp } from "react-native";
import { Text } from "../text";

export interface LottieProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const Lottie = ({ size = 80, style }: LottieProps) => {
  const dynamicStyles = StyleSheet.create({
    lottie: {
      width: size,
      height: size,
    },
  });

  // 브라우저에서 사용할 때 렌더링 오류 방지, 나중에 수정 필요
  if (typeof HTMLElement !== "undefined") {
    const originalGetBoundingClientRect =
      HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function () {
      const rect = originalGetBoundingClientRect.call(this);
      return {
        ...rect,
        width: size,
        height: size,
      };
    };
  }

  return (
    <View style={style}>
      {/* <LottieView
        source={require('@assets/lottie.json')}
        autoPlay
        loop
        style={dynamicStyles.lottie}
      /> */}
      {/* <Text>
				로딩중...
			</Text> */}
    </View>
  );
};
