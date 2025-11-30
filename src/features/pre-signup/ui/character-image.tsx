import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { ImageResource } from '@shared/ui';
import { ImageResources } from '@/src/shared/libs/image';

interface CharacterImageProps {
  style?: any;
}

const styles = StyleSheet.create({
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1/1.125,
    overflow: 'hidden',
  },
  imageResource: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
  },
});

export const CharacterImage: React.FC<CharacterImageProps> = ({ style }) => {
  return (
    <Animated.View style={[styles.animatedContainer, style]}>
      <View style={styles.imageContainer}>
        <ImageResource
          resource={ImageResources.PRE_SIGNUP_CHARACTER}
          contentFit="contain"
          loadingTitle="캐릭터 이미지 로딩 중..."
          style={styles.imageResource}
        />
      </View>
    </Animated.View>
  );
};
