import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '../text';
import { type VariantProps } from 'class-variance-authority';
import * as ImagePicker from 'expo-image-picker';
import { platform } from '@/src/shared/libs/platform';
import { ContentSelector, contentSelector } from '../content-selector';

export interface ImageSelectorProps extends VariantProps<typeof contentSelector> {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  actionLabel?: string;
}

// Static method for picking an image
export async function pickImage(): Promise<string | null> {
  if (platform({ web: () => true, default: () => false })) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    return new Promise<string | null>((resolve) => {
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            resolve(result);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  } else {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  }
}

// Static method for rendering an image
export function renderImage(value: string | null) {
  if (!value) return null;
  return (
    <Image
      source={{ uri: value }}
      style={{ width: '100%', height: '100%' }}
      contentFit="cover"
    />
  );
}

// Static method for rendering a placeholder
export function renderPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-full h-full bg-[#F3EDFF] flex justify-center items-center">
        <Image
          source={require('@assets/images/image.png')}
          style={{ width: 70, height: 70 }}
          contentFit="cover"
        />
        <Text size="sm" className="text-[#9B94AB]">
          사진 추가하기
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
  actionLabel = '선택',
}: ImageSelectorProps) {

  return (
    <ContentSelector
      value={value}
      onChange={onChange}
      size={size}
      className={className}
      onPress={pickImage}
      actionLabel={actionLabel}
      renderContent={renderImage}
      renderPlaceholder={renderPlaceholder}
    />
  );
}