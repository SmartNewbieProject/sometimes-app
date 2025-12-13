import { useTranslation } from 'react-i18next';
import { SlideContainer } from './slide-container';
import type { SlideComponent } from '../types';

export const SlideStory: SlideComponent = () => {
  const { t } = useTranslation();

  return (
    <SlideContainer
      headline={t('features.onboarding.slides.story.headline')}
      subtext={t('features.onboarding.slides.story.subtext')}
      icon="user-group"
    />
  );
};
