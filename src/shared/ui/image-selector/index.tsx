import PhotoPickerModal from "@/src/features/mypage/ui/modal/image-modal";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useModal } from "../../hooks/use-modal";
import { useDeviceResourceCheck } from "../../hooks/use-device-resource-check";
import { convertToJpeg, isHeicBase64 } from "../../utils/image";
import { compressImage } from "@/src/shared/libs/image-compression";
import { PROFILE_IMAGE_CONFIG } from "@/src/shared/libs/image-compression/config";
import { ContentSelector, type ContentSelectorSize } from "../content-selector";
import { Text } from "../text";
import { LoadingModal } from "../loading-modal";
import { useTranslation } from "react-i18next";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { devLogWithTag, devWarn } from "@/src/shared/utils";

export interface ImageSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  size?: ContentSelectorSize;
  style?: StyleProp<ViewStyle>;
  actionLabel?: string;
  skipCompression?: boolean;
}

export interface ImageSelectorRef {
  openPicker: () => void;
}

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

export function renderPlaceholder(t: (key: string) => string) {
  return (
    <View style={styles.placeholderWrapper}>
      <View style={styles.placeholderContent}>
        <Image
          source={require("@assets/images/image.png")}
          style={{ width: 70, height: 70 }}
          contentFit="cover"
        />
        <Text size="sm" textColor="disabled">
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
  style,
  actionLabel = undefined,
  skipCompression = false,
}, ref) => {
  const { t } = useTranslation();
  const [isImageModal, setImageModal] = useState(false);
  const handlePress = async () => {
    setImageModal(true);
  };

  useImperativeHandle(ref, () => ({
    openPicker: handlePress,
  }));
  const { showErrorModal, showModal, hideModal } = useModal();
  const { checkBeforeImagePick } = useDeviceResourceCheck();

  const pickImage = async () => {
    const hasResources = await checkBeforeImagePick();
    if (!hasResources) {
      setImageModal(false);
      return null;
    }
    devLogWithTag('ImageSelector', 'pickImage started');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    devLogWithTag('ImageSelector', 'Permission status:', status);

    if (status !== "granted") {
      devLogWithTag('ImageSelector', 'Permission denied');
      Alert.alert("권한 필요", "사진을 가져오기 위해서는 권한이 필요합니다.", [
        { text: t("common.설정_열기"), onPress: () => Linking.openSettings() },
        {
          text: t("common.닫기"),
        },
      ]);
      setImageModal(false);
      return null;
    }

    devLogWithTag('ImageSelector', 'Launching image picker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "livePhotos"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });
    devLogWithTag('ImageSelector', 'Image picker result:', { canceled: result.canceled, assetsCount: result.assets?.length });

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      devLogWithTag('ImageSelector', 'Picked image URI length:', pickedUri.length);

      setImageModal(false);

      if (Platform.OS === "web" && isHeicBase64(pickedUri)) {
        devLogWithTag('ImageSelector', 'HEIC format detected on web');
        showErrorModal(
          "이미지 형식은 jpeg, jpg, png 형식만 가능해요",
          "announcement"
        );
        return null;
      }

      devLogWithTag('ImageSelector', 'Converting to JPEG...');
      let jpegUri = await convertToJpeg(pickedUri);
      devLogWithTag('ImageSelector', 'JPEG URI length:', jpegUri.length);

      if (!skipCompression) {
        try {
          devLogWithTag('ImageSelector', 'Starting compression...');
          showModal({
            custom: () => <LoadingModal message={t("common.이미지를_최적화하고_있어요")} />,
          });

          const compressed = await compressImage(jpegUri, PROFILE_IMAGE_CONFIG);
          jpegUri = compressed.uri;
          devLogWithTag('ImageSelector', 'Compression completed, URI length:', jpegUri.length);

          hideModal();
        } catch (error) {
          devWarn(t("common.이미지_압축_실패_원본_사용"), error);
          hideModal();
        }
      }

      devLogWithTag('ImageSelector', 'Calling onChange with URI length:', jpegUri.length);
      onChange(jpegUri);
      devLogWithTag('ImageSelector', 'onChange called successfully');
    } else {
      devLogWithTag('ImageSelector', 'Image selection canceled');
      setImageModal(false);
    }
    return null;
  };

  const takePhoto = async () => {
    const hasResources = await checkBeforeImagePick();
    if (!hasResources) {
      setImageModal(false);
      return null;
    }

    devLogWithTag('ImageSelector', 'takePhoto started');
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    devLogWithTag('ImageSelector', 'Camera permission status:', status);

    if (status !== "granted") {
      devLogWithTag('ImageSelector', 'Camera permission denied');
      Alert.alert("권한 필요", "카메라 사용을 위해서 권한이 필요합니다", [
        { text: t("common.설정_열기"), onPress: () => Linking.openSettings() },
        {
          text: t("common.닫기"),
        },
      ]);
      setImageModal(false);
      return null;
    }

    devLogWithTag('ImageSelector', 'Launching camera...');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "livePhotos"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });
    devLogWithTag('ImageSelector', 'Camera result:', { canceled: result.canceled, assetsCount: result.assets?.length });

    status = (await MediaLibrary.requestPermissionsAsync()).status;
    if (status === "granted" && result.assets?.[0].uri) {
      MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
    }

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      devLogWithTag('ImageSelector', 'Captured image URI length:', pickedUri.length);

      setImageModal(false);

      if (Platform.OS === "web" && isHeicBase64(pickedUri)) {
        devLogWithTag('ImageSelector', 'HEIC format detected on web (camera)');
        showErrorModal(
          "이미지 형식은 jpeg, jpg, png 형식만 가능해요",
          "announcement"
        );
        return null;
      }

      devLogWithTag('ImageSelector', 'Converting to JPEG (camera)...');
      let jpegUri = await convertToJpeg(pickedUri);
      devLogWithTag('ImageSelector', 'JPEG URI length (camera):', jpegUri.length);

      if (!skipCompression) {
        try {
          devLogWithTag('ImageSelector', 'Starting compression (camera)...');
          showModal({
            custom: () => <LoadingModal message={t("common.이미지를_최적화하고_있어요")} />,
          });

          const compressed = await compressImage(jpegUri, PROFILE_IMAGE_CONFIG);
          jpegUri = compressed.uri;
          devLogWithTag('ImageSelector', 'Compression completed (camera), URI length:', jpegUri.length);

          hideModal();
        } catch (error) {
          devWarn(t("common.이미지_압축_실패_원본_사용"), error);
          hideModal();
        }
      }

      devLogWithTag('ImageSelector', 'Calling onChange (camera) with URI length:', jpegUri.length);
      onChange(jpegUri);
      devLogWithTag('ImageSelector', 'onChange called successfully (camera)');
    } else {
      devLogWithTag('ImageSelector', 'Camera capture canceled');
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
          style={style}
          actionLabel={actionLabel}
          renderContent={renderImage}
          renderPlaceholder={() => renderPlaceholder(t)}
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

const styles = StyleSheet.create({
  placeholderWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderContent: {
    width: "100%",
    height: "100%",
    backgroundColor: semanticColors.surface.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
});
