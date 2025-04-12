import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '../text';
import { cn } from '@/src/shared/libs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as ImagePicker from 'expo-image-picker';
import { platform } from '@/src/shared/libs/platform';

const imageSelector = cva('rounded-[20px] relative overflow-hidden border-2', {
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
  const [_value, setValue] = useState<string | null>(value ?? null);

  const pickImage = async () => {
    if (platform({ web: () => true, default: () => false })) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            setValue(result);
            onChange(result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setValue(uri);
        onChange(uri);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      activeOpacity={0.8}
    >
      <View className={cn(
        imageSelector({ size }),
        !!_value ? 'border-primaryPurple' : 'border-[#E2D5FF]',
        className)}>
        <View className={cn(
          "absolute top-0 right-0 z-10 px-2.5 py-1 rounded-bl-lg  text-white",
          !!_value ? 'bg-primaryPurple' : 'bg-[#E2D5FF]',
        )}>
          <Text size="sm" textColor="white">
            선택
          </Text>
        </View>
        {_value && (
          <Image
            source={{ uri: _value }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        )}

        {!_value && (
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
        )}
      </View>
    </TouchableOpacity>
  );
} 