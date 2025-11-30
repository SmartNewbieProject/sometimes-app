import { useModal } from "@/src/shared/hooks/use-modal";
import { convertToJpeg, isHeicBase64 } from "@/src/shared/utils/image";
import { semanticColors } from "@/src/shared/constants/colors";
import SendChatIcon from "@assets/icons/send-chat.svg";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import type React from "react";
import { type ChangeEvent, useRef, useState } from "react";
import { Alert, Linking, Platform, StyleSheet, View, TouchableOpacity } from "react-native-web";
import { useAuth } from "../../auth";
import PhotoPickerModal from "../../mypage/ui/modal/image-modal";
import useKeyboardResizeEffect from "../hooks/use-keyboard-resize-effect";
import useChatRoomDetail from "../queries/use-chat-room-detail";
import { chatEventBus } from "../services/chat-event-bus";
import { generateTempId } from "../utils/generate-temp-id";

function WebChatInput() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chat, setChat] = useState("");
  const { data: roomDetail, isError } = useChatRoomDetail(id);
  const queryClient = useQueryClient();
  const { my: user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cloneRef = useRef<HTMLTextAreaElement>(null);
  const { showErrorModal } = useModal();
  const [isImageModal, setImageModal] = useState(false);
  const handlePress = async () => {
    setImageModal(true);
  };
  useKeyboardResizeEffect();
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진을 가져오기 위해서는 권한이 필요합니다.", [
        { text: "설정 열기", onPress: () => Linking.openSettings() },
        {
          text: "닫기",
        },
      ]);
      setImageModal(false);
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      if (Platform.OS === "web" && isHeicBase64(pickedUri)) {
        showErrorModal(
          "이미지 형식은 jpeg, jpg, png 형식만 가능해요",
          "announcement"
        );
        setImageModal(false);
        return null;
      }

      if (roomDetail?.partnerId && user?.id) {
        chatEventBus.emit({
          type: "IMAGE_UPLOAD_REQUESTED",
          payload: {
            to: roomDetail.partnerId,
            chatRoomId: id,
            senderId: user.id,
            file: pickedUri,
            tempId: generateTempId(),
          },
        });
      }
      setImageModal(false);
    }

    setImageModal(false);
    return null;
  };

  const takePhoto = async () => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 사용을 위해서 권한이 필요합니다", [
        { text: "설정 열기", onPress: () => Linking.openSettings() },
        {
          text: "닫기",
        },
      ]);
      setImageModal(false);
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
      if (Platform.OS === "web" && isHeicBase64(pickedUri)) {
        showErrorModal(
          "이미지 형식은 jpeg, jpg, png 형식만 가능해요",
          "announcement"
        );
        setImageModal(false);
        return null;
      }
      if (roomDetail?.partnerId && user?.id) {
        chatEventBus.emit({
          type: "IMAGE_UPLOAD_REQUESTED",
          payload: {
            to: roomDetail.partnerId,
            chatRoomId: id,
            senderId: user.id,
            file: pickedUri,
            tempId: generateTempId(),
          },
        });

        setImageModal(false);
      } else {
        setImageModal(false);
      }
      queryClient.refetchQueries({ queryKey: ["chat-list", id] });
    } else {
      setImageModal(false);
    }
    return null;
  };
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setChat(e.target.value);
    const elem = textareaRef.current;
    const cloneElem = cloneRef.current;
    if (!elem || !cloneElem) return;
    cloneElem.value = elem.value;

    elem.rows = Math.min(
      Math.max(Math.floor(cloneElem.scrollHeight / cloneElem.clientHeight), 1),
      3
    );
  };

  const handleSend = () => {
    console.log("chat", chat);
    if (
      !textareaRef.current ||
      chat === "" ||
      !roomDetail?.partnerId ||
      !user.id
    ) {
      return;
    }

    chatEventBus.emit({
      type: "MESSAGE_SEND_REQUESTED",
      payload: {
        to: roomDetail.partnerId,
        chatRoomId: id,
        senderId: user.id,
        content: chat,
        tempId: generateTempId(),
      },
    });
    setChat("");
  };

  return (
    <View style={styles.container}>
      <PhotoPickerModal
        showGuide={false}
        visible={isImageModal}
        onClose={() => setImageModal(false)}
        onTakePhoto={takePhoto}
        onPickFromGallery={pickImage}
      />
      <TouchableOpacity
        onPress={handlePress}
        style={styles.photoButton}
      >
        <PlusIcon />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={chat}
          onChange={handleChange}
          rows={1}
          readOnly={roomDetail?.hasLeft}
          placeholder={
            roomDetail?.hasLeft ? "대화가 종료되었어요" : "메세지를 입력하세요"
          }
          style={styles.textarea}
        />
        <textarea
          style={styles.cloneTextarea}
          readOnly
          ref={cloneRef}
          rows={1}
        />

        {chat !== "" ? (
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendButton}
            aria-label="Send message"
          >
            <SendChatIcon width={20} height={20} />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyButton} />
        )}
      </View>
    </View>
  );
}

function PlusIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.125 14.75H0.875V0.75H13.125V14.75Z" />
      <path
        d="M7.875 2.9375C7.875 2.45352 7.48398 2.0625 7 2.0625C6.51602 2.0625 6.125 2.45352 6.125 2.9375V6.875H2.1875C1.70352 6.875 1.3125 7.26602 1.3125 7.75C1.3125 8.23398 1.70352 8.625 2.1875 8.625H6.125V12.5625C6.125 13.0465 6.51602 13.4375 7 13.4375C7.48398 13.4375 7.875 13.0465 7.875 12.5625V8.625H11.8125C12.2965 8.625 12.6875 8.23398 12.6875 7.75C12.6875 7.26602 12.2965 6.875 11.8125 6.875H7.875V2.9375Z"
        fill="#7A4AE1"
      />
    </svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    backgroundColor: semanticColors.surface.background,
    padding: 16,
  },
  photoButton: {
    height: 32,
    width: 32,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: semanticColors.surface.background,
  },
  inputContainer: {
    position: 'relative',
    marginLeft: 12,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: semanticColors.surface.surface,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingLeft: 16,
  },
  textarea: {
    flex: 1,
    lineHeight: 18,
    resize: 'none',
    overflowY: 'auto',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    fontSize: 16,
    color: semanticColors.text.secondary,
    border: 'none',
    outline: 'none',
  },
  cloneTextarea: {
    lineHeight: 18,
    boxSizing: 'border-box',
    width: '100%',
    resize: 'none',
    overflowY: 'auto',
    margin: 0,
    padding: 0,
    position: 'absolute',
    top: -9999,
    left: -9999,
    zIndex: -10,
  },
  sendButton: {
    height: 32,
    width: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    borderRadius: 16,
    backgroundColor: semanticColors.brand.primary,
  },
  emptyButton: {
    height: 32,
    width: 32,
  },
});

export default WebChatInput;
