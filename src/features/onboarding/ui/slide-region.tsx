import { useTranslation } from 'react-i18next';
import { SlideContainer } from './slide-container';
import type { SlideComponent } from '../types';

export const SlideRegion: SlideComponent = () => {
  const { t } = useTranslation();

  return (
    <SlideContainer
      headline={t('features.onboarding.slides.region.headline')}
      subtext={t('features.onboarding.slides.region.subtext')}
      icon="map-location-dot"
    />
  );
};
