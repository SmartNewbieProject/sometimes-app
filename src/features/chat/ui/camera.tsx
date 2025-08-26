import { convertToJpeg } from "@/src/shared/utils/image";
import ChatCameraIcon from "@assets/icons/chat-camera.svg";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";
function ChatCamera() {
  const takePhoto = async () => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 사용을 위해서 권한이 필요합니다", [
        { text: "설정 열기", onPress: () => Linking.openSettings() },
        {
          text: "닫기",
        },
      ]);

      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });
    status = (await MediaLibrary.requestPermissionsAsync()).status;
    if (status === "granted" && result.assets?.[0].uri) {
      MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
    }

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;

      const jpegUri = await convertToJpeg(pickedUri);
    }

    return null;
  };
  return (
    <Pressable onPress={takePhoto} style={styles.container}>
      <ChatCameraIcon />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatCamera;
