import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ImageResource } from '@shared/ui';
import { ImageResources } from '@/src/shared/libs/image';
import { useTranslation } from 'react-i18next';

interface CharacterImageProps {
  style?: any;
}

export const CharacterImage: React.FC<CharacterImageProps> = ({ style }) => {
  
  const { t } = useTranslation();

  return (
    <Animated.View className="w-full flex items-center justify-center" style={style}>
      <View style={{
        width: '100%',
        maxWidth: 400,
        aspectRatio: 1/1.125,
        overflow: 'hidden'
      }}>
        <ImageResource
          resource={ImageResources.PRE_SIGNUP_CHARACTER}
          contentFit="contain"
          loadingTitle={t("features.pre-signup.ui.common.loading_character_image")}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
          }}
          className="w-full h-full"
        />
      </View>
    </Animated.View>
  );
};
