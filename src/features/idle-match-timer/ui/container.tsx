import { PurpleGradient } from "@/src/shared/ui";
import { ImageBackground } from "expo-image";
import { type ReactNode, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useMatchingBackground } from "../hooks";
import { useLatestMatching } from "../queries";

type ContainerProps = {
  children: ReactNode;
  gradientMode: boolean;
};

export const Container = ({ children, gradientMode }: ContainerProps) => {
  const { match, isLoading: matchLoading, refetch } = useLatestMatching();

  const [width, setWidth] = useState(0);
  const { uri: backgroundUri } = useMatchingBackground();
  const onLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;

    setWidth(layoutWidth);
  };
  console.log("width", width, match);

  if (gradientMode) {
    return (
      <View
        onLayout={onLayout}
        style={[
          styles.imageBackground,
          { height: match?.type === "not-found" ? 600 : width },
        ]}
      >
        <PurpleGradient />
        {children}
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      onLayout={onLayout}
      style={[
        styles.imageBackground,
        { height: match?.type === "not-found" ? 600 : width },
      ]}
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
    borderRadius: 20,
  },
  imageBackground: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
