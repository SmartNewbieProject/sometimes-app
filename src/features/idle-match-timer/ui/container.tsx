import { PurpleGradient } from "@/src/shared/ui";
import { ImageBackground } from "expo-image";
import { type ReactNode, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useMatchingBackground } from "../hooks";

type ContainerProps = {
  children: ReactNode;
  gradientMode: boolean;
};

export const Container = ({ children, gradientMode }: ContainerProps) => {
  const { uri: backgroundUri } = useMatchingBackground();

  if (gradientMode) {
    return (
      <View style={[styles.imageBackground, { height: 580 }]}>
        <PurpleGradient />
        {children}
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={[styles.imageBackground, { height: 580 }]}
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
