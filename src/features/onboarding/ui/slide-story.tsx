import { useTranslation } from 'react-i18next';
import { SlideContainer } from './slide-container';
import { WalkingMiho } from '../animations/walking-miho';
import type { SlideComponent } from '../types';

export const SlideStory: SlideComponent = ({ isActive }) => {
  const { t } = useTranslation();

  return (
    <SlideContainer
      headline={t('features.onboarding.slides.story.headline')}
      subtext={t('features.onboarding.slides.story.subtext')}
    >
      <WalkingMiho isActive={isActive} />
    </SlideContainer>
  );
};
