import React, { type ReactNode } from "react";
import { router } from "expo-router";
import type { StyleProp, ViewStyle } from "react-native";
import {
  Container,
  LeftButton,
  LeftContent,
  CenterContent,
  Logo,
  RightContent,
} from "./ui";

type HeaderProps = {
  title?: string;
  showLogo?: boolean;
  showBackButton?: boolean;
  rightContent?: ReactNode;
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
  centered?: boolean;
  logoSize?: number;
};

export function Header({
  title,
  showLogo = true,
  showBackButton = false,
  rightContent,
  onBackPress,
  style,
  centered = false,
  logoSize = 32,
}: HeaderProps) {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <Container style={style} centered={centered}>
      {showBackButton && (
        <LeftContent>
          <LeftButton visible onPress={handleBackPress} />
        </LeftContent>
      )}

      <Logo title={title} showLogo={showLogo} logoSize={logoSize} />

      <RightContent>{rightContent}</RightContent>
    </Container>
  );
}

Header.Container = Container;
Header.LeftContent = LeftContent;
Header.LeftButton = LeftButton;
Header.CenterContent = CenterContent;
Header.Logo = Logo;
Header.RightContent = RightContent;
