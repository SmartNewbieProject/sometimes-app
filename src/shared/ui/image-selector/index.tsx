import PhotoPickerModal from "@/src/features/mypage/ui/modal/image-modal";
import { platform } from "@/src/shared/libs/platform";
import type { VariantProps } from "class-variance-authority";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Alert, Linking, Platform, Pressable, View } from "react-native";
import { useModal } from "../../hooks/use-modal";
import { useToast } from "../../hooks/use-toast";
import { convertToJpeg, isHeicBase64 } from "../../utils/image";
import { compressImage } from "@/src/shared/libs/image-compression";
import { PROFILE_IMAGE_CONFIG } from "@/src/shared/libs/image-compression/config";
import { ContentSelector, type contentSelector } from "../content-selector";
import { Text } from "../text";
import { LoadingModal } from "../loading-modal";
import { useTranslation } from "react-i18next";

export interface ImageSelectorProps
  extends VariantProps<typeof contentSelector> {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  actionLabel?: string;
  skipCompression?: boolean;
}

export interface ImageSelectorRef {
  openPicker: () => void;
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
      <View className="w-full h-full bg-surface-secondary flex justify-center items-center">
        <Image
          source={require("@assets/images/image.png")}
          style={{ width: 70, height: 70 }}
          contentFit="cover"
        />
        <Text size="sm" className="text-text-disabled">
          {t("shareds.image-selector.image_selector.add_photo")}
        </Text>
      </View>
    </View>
  );
}

export const ImageSelector = forwardRef<ImageSelectorRef, ImageSelectorProps>(({
  value,
  onChange,
  size,
  className,
  actionLabel = undefined,
  skipCompression = false,
}, ref) => {
  const [isImageModal, setImageModal] = useState(false);
  const handlePress = async () => {
    setImageModal(true);
  };

  useImperativeHandle(ref, () => ({
    openPicker: handlePress,
  }));
  const { showErrorModal, showModal, hideModal } = useModal();
  const { emitToast } = useToast();
  const pickImage = async () => {
    console.log('[ImageSelector] pickImage started');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('[ImageSelector] Permission status:', status);

    if (status !== "granted") {
      console.log('[ImageSelector] Permission denied');
      Alert.alert("권한 필요", "사진을 가져오기 위해서는 권한이 필요합니다.", [
        { text: "설정 열기", onPress: () => Linking.openSettings() },
        {
          text: "닫기",
        },
      ]);
      setImageModal(false);
      return null;
    }

    console.log('[ImageSelector] Launching image picker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "livePhotos"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });
    console.log('[ImageSelector] Image picker result:', { canceled: result.canceled, assetsCount: result.assets?.length });

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      console.log('[ImageSelector] Picked image URI length:', pickedUri.length);

      // 이미지 선택 모달 즉시 닫기
      setImageModal(false);

      if (Platform.OS === "web" && isHeicBase64(pickedUri)) {
        console.log('[ImageSelector] HEIC format detected on web');
        showErrorModal(
          "이미지 형식은 jpeg, jpg, png 형식만 가능해요",
          "announcement"
        );
        return null;
      }

      console.log('[ImageSelector] Converting to JPEG...');
      let jpegUri = await convertToJpeg(pickedUri);
      console.log('[ImageSelector] JPEG URI length:', jpegUri.length);

      if (!skipCompression) {
        try {
          console.log('[ImageSelector] Starting compression...');
          // 로딩 모달 표시
          showModal({
            custom: () => <LoadingModal message="이미지를 최적화하고 있어요..." />,
          });

          const compressed = await compressImage(jpegUri, PROFILE_IMAGE_CONFIG);
          jpegUri = compressed.uri;
          console.log('[ImageSelector] Compression completed, URI length:', jpegUri.length);

          // 로딩 모달 닫기
          hideModal();
        } catch (error) {
          console.warn('이미지 압축 실패, 원본 사용:', error);
          hideModal();
        }
      }

      console.log('[ImageSelector] Calling onChange with URI length:', jpegUri.length);
      onChange(jpegUri);
      console.log('[ImageSelector] onChange called successfully');
    } else {
      console.log('[ImageSelector] Image selection canceled');
      setImageModal(false);
    }
    return null;
  };

  const takePhoto = async () => {
    console.log('[ImageSelector] takePhoto started');
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log('[ImageSelector] Camera permission status:', status);

    if (status !== "granted") {
      console.log('[ImageSelector] Camera permission denied');
      Alert.alert("권한 필요", "카메라 사용을 위해서 권한이 필요합니다", [
        { text: "설정 열기", onPress: () => Linking.openSettings() },
        {
          text: "닫기",
        },
      ]);
      setImageModal(false);
      return null;
    }

    console.log('[ImageSelector] Launching camera...');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "livePhotos"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });
    console.log('[ImageSelector] Camera result:', { canceled: result.canceled, assetsCount: result.assets?.length });

    status = (await MediaLibrary.requestPermissionsAsync()).status;
    if (status === "granted" && result.assets?.[0].uri) {
      MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
    }

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      console.log('[ImageSelector] Captured image URI length:', pickedUri.length);

      // 사진 촬영 모달 즉시 닫기
      setImageModal(false);

      if (Platform.OS === "web" && isHeicBase64(pickedUri)) {
        console.log('[ImageSelector] HEIC format detected on web (camera)');
        showErrorModal(
          "이미지 형식은 jpeg, jpg, png 형식만 가능해요",
          "announcement"
        );
        return null;
      }

      console.log('[ImageSelector] Converting to JPEG (camera)...');
      let jpegUri = await convertToJpeg(pickedUri);
      console.log('[ImageSelector] JPEG URI length (camera):', jpegUri.length);

      if (!skipCompression) {
        try {
          console.log('[ImageSelector] Starting compression (camera)...');
          // 로딩 모달 표시
          showModal({
            custom: () => <LoadingModal message="이미지를 최적화하고 있어요..." />,
          });

          const compressed = await compressImage(jpegUri, PROFILE_IMAGE_CONFIG);
          jpegUri = compressed.uri;
          console.log('[ImageSelector] Compression completed (camera), URI length:', jpegUri.length);

          // 로딩 모달 닫기
          hideModal();
        } catch (error) {
          console.warn('이미지 압축 실패, 원본 사용:', error);
          hideModal();
        }
      }

      console.log('[ImageSelector] Calling onChange (camera) with URI length:', jpegUri.length);
      onChange(jpegUri);
      console.log('[ImageSelector] onChange called successfully (camera)');
    } else {
      console.log('[ImageSelector] Camera capture canceled');
      setImageModal(false);
    }
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
});
