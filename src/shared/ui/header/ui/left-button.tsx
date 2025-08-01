import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import ChevronLeftIcon from "@assets/icons/chevron-left.svg";

interface LeftButtonProps {
  onPress?: () => void;
  visible?: boolean;
}

export function LeftButton({ onPress, visible = false }: LeftButtonProps) {
  if (!visible) {
    return <View className="w-10" />;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View className="w-10 h-10 items-center justify-center">
        <ChevronLeftIcon />
      </View>
    </TouchableOpacity>
  );
}
