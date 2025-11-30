import React, { type ReactNode } from "react";
import { router } from "expo-router";
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
  centered?: boolean;
  logoSize?: number;
};

export function Header({
  title,
  showLogo = true,
  showBackButton = false,
  rightContent,
  onBackPress,
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
    <Container centered={centered}>
      <LeftContent>
        <LeftButton visible={showBackButton} onPress={handleBackPress} />
      </LeftContent>

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
