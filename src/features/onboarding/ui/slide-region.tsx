import { Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SlideContainer } from './slide-container';
import type { SlideComponent } from '../types';

const sameRegionImage = require('@assets/images/onboarding/region/same_region.png');

export const SlideRegion: SlideComponent = () => {
  const { t } = useTranslation();

  return (
    <SlideContainer
      headline={t('features.onboarding.slides.region.headline')}
      subtext={t('features.onboarding.slides.region.subtext')}
    >
      <Image source={sameRegionImage} style={styles.image} resizeMode="contain" />
    </SlideContainer>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 450,
    height: 340,
  },
});
