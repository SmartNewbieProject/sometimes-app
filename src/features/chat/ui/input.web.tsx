import { useModal } from "@/src/shared/hooks/use-modal";
import { convertToJpeg, isHeicBase64 } from "@/src/shared/utils/image";
import SendChatIcon from "@assets/icons/send-chat.svg";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import type React from "react";
import { useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import PhotoPickerModal from "../../mypage/ui/modal/image-modal";
function WebChatInput() {
  const [chat, setChat] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cloneRef = useRef<HTMLTextAreaElement>(null);
  const { showErrorModal } = useModal();
  const [isImageModal, setImageModal] = useState(false);
  const handlePress = async () => {
    setImageModal(true);
  };

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
      const jpegUri = await convertToJpeg(pickedUri);

      // onChange(jpegUri);
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
      const jpegUri = await convertToJpeg(pickedUri);
    }
    setImageModal(false);
    return null;
  };
  const handleChange = () => {
    const elem = textareaRef.current;
    const cloneElem = cloneRef.current;
    if (!elem || !cloneElem) return;
    cloneElem.value = elem.value;
    setChat(elem.value);
    elem.rows = Math.min(
      Math.max(Math.floor(cloneElem.scrollHeight / cloneElem.clientHeight), 1),
      3
    );
  };

  return (
    <div className="flex w-full items-center bg-white p-4 ">
      <PhotoPickerModal
        showGuide={false}
        visible={isImageModal}
        onClose={() => setImageModal(false)}
        onTakePhoto={takePhoto}
        onPickFromGallery={pickImage}
      />
      <button
        onClick={handlePress}
        type="button"
        className="flex h-8 w-8 border-none items-center justify-center rounded-full bg-[#F3EDFF] hover:bg-purple-200 transition-colors focus:outline-none "
      >
        <PlusIcon />
      </button>

      <div className="relative ml-3 flex flex-1 items-center rounded-full bg-[#F8F9FA] py-[8px] px-2 pl-4">
        <textarea
          ref={textareaRef}
          onChange={handleChange}
          rows={1}
          placeholder="메세지를 입력하세요"
          className="flex-1 leading-[16px] resize-none overflow-y-scroll  bg-transparent m-0 p-0 text-[16px] text-[#1E2229] placeholder-gray-500 focus:outline-none "
        />
        <textarea
          className="leading-[16px] box-border w-full resize-none overflow-y-scroll m-0 p-0 absolute -top-[9999px] -left-[9999px] -z-10"
          readOnly
          ref={cloneRef}
          rows={1}
        />
        {chat !== "" ? (
          <button
            type="button"
            onClick={() => {}}
            className=" flex h-8 w-8 flex-shrink-0 items-center justify-center self-end rounded-full bg-[#7A4AE1] text-white hover:bg-purple-700 transition-colors focus:outline-none "
            aria-label="Send message"
            disabled={!chat.trim()}
          >
            <SendChatIcon width={20} height={20} />
          </button>
        ) : (
          <div className="w-8 h-8 " />
        )}
      </div>
    </div>
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

export default WebChatInput;
