import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import ChevronLeftIcon from "@assets/icons/chevron-left.svg";

const styles = StyleSheet.create({
  placeholder: {
    width: 40,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface LeftButtonProps {
  onPress?: () => void;
  visible?: boolean;
}

export function LeftButton({ onPress, visible = false }: LeftButtonProps) {
  if (!visible) {
    return <View style={styles.placeholder} />;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.button}>
        <ChevronLeftIcon />
      </View>
    </TouchableOpacity>
  );
}
