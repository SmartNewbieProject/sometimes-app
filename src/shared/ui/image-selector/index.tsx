import PhotoPickerModal from "@/src/features/mypage/ui/modal/image-modal";
import { platform } from "@/src/shared/libs/platform";
import type { VariantProps } from "class-variance-authority";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useState } from "react";
import { Alert, Linking, Platform, Pressable, View } from "react-native";
import { useModal } from "../../hooks/use-modal";
import { convertToJpeg, isHeicBase64 } from "../../utils/image";
import { ContentSelector, type contentSelector } from "../content-selector";
import { Text } from "../text";
import { useTranslation } from "react-i18next";

export interface ImageSelectorProps
  extends VariantProps<typeof contentSelector> {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  actionLabel?: string;
}

// Static method for rendering an image
export function renderImage(value: string | null, isPlaceHolder?: boolean) {
  if (!value) return null;
  return (
    <Image
      source={isPlaceHolder ? value : { uri: value }}
      style={{ width: "100%", height: "100%" }}
      contentFit="cover"
    />
  );
}

// Static method for rendering a placeholder
export function renderPlaceholder() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-full h-full bg-[#F3EDFF] flex justify-center items-center">
        <Image
          source={require("@assets/images/image.png")}
          style={{ width: 70, height: 70 }}
          contentFit="cover"
        />
        <Text size="sm" className="text-[#9B94AB]">
          {t("shareds.image-selector.image_selector.add_photo")}
        </Text>
      </View>
    </View>
  );
}

export function ImageSelector({
  value,
  onChange,
  size,
  className,
  actionLabel = undefined,
}: ImageSelectorProps) {
  const [isImageModal, setImageModal] = useState(false);
  const handlePress = async () => {
    setImageModal(true);
  };
  const { showErrorModal } = useModal();
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
      mediaTypes: ["images", "livePhotos"],
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
      onChange(jpegUri);
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
      mediaTypes: ["images", "livePhotos"],
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
      onChange(jpegUri);
    }
    setImageModal(false);
    return null;
  };

  return (
    <>
      <Pressable onPress={handlePress}>
        <ContentSelector
          value={value}
          size={size}
          className={className}
          actionLabel={actionLabel}
          renderContent={renderImage}
          renderPlaceholder={renderPlaceholder}
        />
      </Pressable>
      <PhotoPickerModal
        visible={isImageModal}
        onClose={() => setImageModal(false)}
        onTakePhoto={takePhoto}
        onPickFromGallery={pickImage}
      />
    </>
  );
}
