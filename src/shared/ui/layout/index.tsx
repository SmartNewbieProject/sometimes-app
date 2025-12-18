import React, { type ReactNode } from "react";
import { StyleSheet, View, ScrollView, type StyleProp, type ViewStyle } from "react-native";
import { PalePurpleGradient } from "../gradient";
import { BottomNavigation } from "../navigation";

type MainLayoutProps = {
  children: ReactNode;
  showNavigation?: boolean;
  showGradient?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function MainLayout({
  children,
  showNavigation = true,
  showGradient = true,
  style,
  contentStyle,
}: MainLayoutProps) {
  return (
    <View style={[styles.container, style]}>
      {showGradient && <PalePurpleGradient />}

      <View style={[styles.content, contentStyle]}>{children}</View>

      {showNavigation && <BottomNavigation />}
    </View>
  );
}

type ScrollableLayoutProps = MainLayoutProps & {
  scrollStyle?: StyleProp<ViewStyle>;
};

export function ScrollableLayout({
  children,
  showNavigation = true,
  showGradient = true,
  style,
  contentStyle,
  scrollStyle,
}: ScrollableLayoutProps) {
  return (
    <MainLayout
      showNavigation={showNavigation}
      showGradient={showGradient}
      style={style}
      contentStyle={contentStyle}
    >
      <ScrollView style={[styles.scroll, scrollStyle]}>{children}</ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
