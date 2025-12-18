import React from 'react';
import { StyleSheet, View } from 'react-native';
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
    <Animated.View style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <ImageResource
          resource={ImageResources.PRE_SIGNUP_CHARACTER}
          contentFit="contain"
          loadingTitle={t("features.pre-signup.ui.common.loading_character_image")}
          style={styles.image}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1 / 1.125,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
  },
});
