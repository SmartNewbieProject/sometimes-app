import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ChatProfileImageProps {
  imageUri: string;
}

function ChatProfileImage({ imageUri }: ChatProfileImageProps) {
  return <Image style={styles.profileImage} source={imageUri} />;
}

const styles = StyleSheet.create({
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 9999,
  },
});

export default ChatProfileImage;
