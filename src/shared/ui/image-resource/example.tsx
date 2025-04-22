import React from 'react';
import { View } from 'react-native';
import { ImageResource } from './index';
import { ImageResources } from '@/src/shared/libs/image';
import { Text } from '@/src/shared/ui/text';

export const ImageResourceExample: React.FC = () => {
  return (
    <View className="flex flex-col items-center p-4 gap-4">
      <Text size="lg" weight="bold">이미지 리소스 예제</Text>
      
      <View className="flex flex-row items-center justify-between w-full">
        <View className="flex flex-col items-center">
          <Text size="sm" className="mb-2">티켓 이미지</Text>
          <ImageResource 
            resource={ImageResources.TICKET} 
            width={150} 
            height={150} 
            contentFit="contain"
            loadingTitle="티켓 이미지 로딩 중..."
          />
        </View>
        
        <View className="flex flex-col items-center">
          <Text size="sm" className="mb-2">SMS 체크 이미지</Text>
          <ImageResource 
            resource={ImageResources.SMS_CHECK} 
            width={150} 
            height={150} 
            contentFit="contain"
            loadingTitle="SMS 이미지 로딩 중..."
          />
        </View>
      </View>
    </View>
  );
};
