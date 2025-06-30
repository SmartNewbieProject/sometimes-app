import { usePathHistory } from "@/src/shared/hooks";
import { router } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import ChevronLeft from '@assets/icons/chevron-left.svg';
import React from "react";

type ContainerProps = {
  children: React.ReactNode;
};

const Container = ({ children }: ContainerProps) => {
  const childrenLength = React.Children.count(children);
  const showBlankRightContent = childrenLength === 2;

  return (
    <View style={styles.container}>
      {children}
      {showBlankRightContent && <View />}
    </View>
  );
};

type LeftProps = {
  mode?: 'back-button' | 'close-button';
  onPress?: () => void;
  children?: React.ReactNode;
}

const BackButton = () => {
  const { getPreviousPath } = usePathHistory();
  // TODO: 히스토리 유지 로직 및 이전 히스토리 조회 훅 내용 구현
  // const previousPath = getPreviousPath();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  // const onPress = () => router.navigate(previousPath as any);
  const onPress = () => router.back();

  return (
    <TouchableOpacity style={styles.leftContent} onPress={onPress}>
      <ChevronLeft />
    </TouchableOpacity>
  );
};
const Left = ({ mode = 'back-button', onPress, children }: LeftProps) => {
  if (mode === 'back-button') {
    return <BackButton />;
  }

  return (
    <TouchableOpacity style={styles.leftContent} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

const Center = ({ children }: ContainerProps) => {
  return (
    <View style={styles.centerContent}>
      {children}
    </View>
  );
};

const Right = ({ children }: ContainerProps) => {
  return (
    <View style={styles.rightContent}>
      {children}
    </View>
  );
}

export const Header = {
  Container,
  Left,
  Center,
  Right,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftContent: {
    width: 'auto',
    height: 'auto',
    padding: 4,
  },
  centerContent: {
    alignItems: 'center',
    marginRight: 32,
  },
  rightContent: {
    width: 48,
    height: 48,
  },
});
