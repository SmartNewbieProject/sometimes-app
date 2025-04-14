import React, { ReactNode } from 'react';
import { router } from 'expo-router';
import { Container, LeftButton, LeftContent, Logo, RightContent } from './ui';

type HeaderProps = {
  title?: string;
  showLogo?: boolean;
  showBackButton?: boolean;
  rightContent?: ReactNode;
  onBackPress?: () => void;
  className?: string;
  centered?: boolean;
  logoSize?: number;
};

export function Header({
  title,
  showLogo = true,
  showBackButton = false,
  rightContent,
  onBackPress,
  className,
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
    <Container className={className} centered={centered}>
      <LeftContent>
        <LeftButton visible={showBackButton} onPress={handleBackPress} />
      </LeftContent>
      
      <Logo title={title} showLogo={showLogo} logoSize={logoSize} />
      
      <RightContent>
        {rightContent}
      </RightContent>
    </Container>
  );
}

// Compound Pattern 구현
Header.Container = Container;
Header.LeftContent = LeftContent;
Header.LeftButton = LeftButton;
Header.Logo = Logo;
Header.RightContent = RightContent;
