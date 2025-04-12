import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '../text';
import { cn } from '@/src/shared/libs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as ImagePicker from 'expo-image-picker';
import { platform } from '@/src/shared/libs/platform';

const imageSelector = cva('rounded-[20px] overflow-hidden border-2 border-dashed border-primaryPurple', {
  variants: {
    size: {
      sm: 'w-[120px] h-[120px]',
      md: 'w-[160px] h-[160px]',
      lg: 'w-[200px] h-[200px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface ImageSelectorProps extends VariantProps<typeof imageSelector> {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageSelector({
  value,
  onChange,
  size,
  className,
}: ImageSelectorProps) {
  const pickImage = async () => {
    if (platform({ web: () => true, default: () => false })) {
      // 웹 환경
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            onChange(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // 모바일 환경
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      activeOpacity={0.8}
    >
      <View className={cn(imageSelector({ size }), className)}>
        {value ? (
          // 이미지가 있는 경우
          <Image
            source={{ uri: value }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          // 이미지가 없는 경우
          <View className="flex-1 items-center justify-center">
            <Text size="sm" textColor="purple" className="text-center">
              {platform({
                web: () => '클릭하여 사진 선택',
                ios: () => '클릭하여 사진 선택',
                android: () => '클릭하여 사진 선택',
              })}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
} 