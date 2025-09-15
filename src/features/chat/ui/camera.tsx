import { useModal } from "@/src/shared/hooks/use-modal";
import { Text } from "@/src/shared/ui";
import { convertToJpeg, uriToBase64 } from "@/src/shared/utils/image";
import ChatCameraIcon from "@assets/icons/chat-camera.svg";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";
import { useChatEvent } from "../hooks/use-chat-event";
import { useOptimisticChat } from "../hooks/use-optimistic-chat";
import { useAuth } from "../../auth";
import useChatRoomDetail from "../queries/use-chat-room-detail";
import type { Chat } from "../types/chat";
function ChatCamera() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showModal, hideModal } = useModal();
  const { data: partner } = useChatRoomDetail(id);
  const { my: user } = useAuth();
  const { actions } = useChatEvent();
  const { addOptimisticMessage, replaceOptimisticMessage, markMessageAsFailed } = useOptimisticChat({ chatRoomId: id });
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
      const imageUri = await uriToBase64(jpegUri);

      showModal({
        title: "이미지 전송",
        children: (
          <Text textColor="black">선택하신 이미지를 전송하시겠어요?</Text>
        ),
        primaryButton: {
          text: "전송",
          onClick: async () => {
            if (!imageUri || !partner?.partnerId || !user?.id) {
              hideModal();
              return;
            }

            try {
              const { optimisticMessage, promise } = await actions.uploadImage({
                to: partner.partnerId,
                chatRoomId: id,
                senderId: user.id,
                file: imageUri
              });

              addOptimisticMessage(optimisticMessage);
              hideModal();
              const result = await promise;
              if (result.success && result.serverMessage) {
                replaceOptimisticMessage(optimisticMessage.tempId!, result.serverMessage);
              } else {
                markMessageAsFailed(optimisticMessage.tempId!, result.error);
              }
            } catch (error) {
              console.error('Camera upload error:', error);
              hideModal();
            }
          },
        },
        secondaryButton: {
          text: "취소",
          onClick: hideModal,
        },
      });
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
