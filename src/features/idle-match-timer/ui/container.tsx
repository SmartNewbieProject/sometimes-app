import { ImageBackground } from "expo-image";
import { ReactNode, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useMatchingBackground } from "../hooks";
import { LayoutChangeEvent } from "react-native";
import { PurpleGradient } from "@/src/shared/ui";

type ContainerProps = {
  children: ReactNode;
  gradientMode: boolean;
};

export const Container = ({ children, gradientMode }: ContainerProps) => {
  const [width, setWidth] = useState(0);
  const { uri: backgroundUri } = useMatchingBackground();

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    setWidth(layoutWidth);
  };

  if (gradientMode) {
    return (
      <View
        onLayout={onLayout}
        style={[styles.imageBackground, { height: width }]}
        className="w-full flex flex-col"
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
      style={[styles.imageBackground, { height: width }]}
      className="w-full flex flex-col"
    >
      {children}
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});
