import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface ImageCollapseProps {
  imageUrls: string[];
}

function ImageCollapse({ imageUrls }: ImageCollapseProps) {
  const collapseValues = useRef<SharedValue<number>[]>(
    imageUrls.map(() => useSharedValue(0))
  );

  useEffect(() => {
    if (imageUrls.length > 0) {
      imageUrls.forEach((_, index) => {
        collapseValues.current[index].value = withDelay(
          index * 150,
          withTiming(1, {
            duration: 150,
            easing: Easing.inOut(Easing.ease),
          })
        );
      });
    }
  }, [imageUrls]);

  return (
    <View style={styles.container}>
      {imageUrls.map((url, index) => (
        <AnimatedImage
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          index={index}
          url={url}
          item={collapseValues.current[index]}
        />
      ))}
    </View>
  );
}

interface AnimatedImageProps {
  url: string;
  index: number;
  item: SharedValue<number>;
}

function AnimatedImage({ url, index, item }: AnimatedImageProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      item.value,
      [0, 1],
      [-16 * index + 10, -16 * index]
    );
    const opacity = interpolate(item.value, [0, 1], [0, 1 - index * 0.1]);
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  return (
    <Animated.Image
      source={{ uri: url }}
      style={[styles.image, { zIndex: 5 - index }, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});

export default ImageCollapse;
