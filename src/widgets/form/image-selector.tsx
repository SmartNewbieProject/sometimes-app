import PhotoPickerModal from "@/src/features/mypage/ui/modal/image-modal";
import {
  ContentSelector,
  type contentSelector,
} from "@/src/shared/ui/content-selector";
import { renderImage, renderPlaceholder } from "@/src/shared/ui/image-selector";
import type { VariantProps } from "class-variance-authority";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import { type UseControllerProps, useController } from "react-hook-form";
import { Alert, Linking, Pressable } from "react-native";
import { FormContentSelector } from "./content-selector";

interface FormImageSelectorProps
  extends UseControllerProps,
    VariantProps<typeof contentSelector> {
  className?: string;
  size?: "sm" | "md" | "lg";
  actionLabel?: string;
}

export function FormImageSelector({
  name,
  control,
  rules,
  className,
  size,
  actionLabel,
}: FormImageSelectorProps) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules,
  });
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
      mediaTypes: ["images", "livePhotos"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });
    console.log("image result", result);
    if (!result.canceled) {
      onChange(result.assets[0].uri);
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
    console.log("camera result", result);
    status = (await MediaLibrary.requestPermissionsAsync()).status;
    if (status === "granted" && result.assets?.[0].uri) {
      MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
    }

    if (!result.canceled) {
      onChange(result.assets[0].uri);
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
