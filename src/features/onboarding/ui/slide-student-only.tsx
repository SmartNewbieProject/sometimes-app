import { useTranslation } from 'react-i18next';
import { SlideContainer } from './slide-container';
import type { SlideComponent } from '../types';

export const SlideStudentOnly: SlideComponent = () => {
  const { t } = useTranslation();

  return (
    <SlideContainer
      headline={t('features.onboarding.slides.studentOnly.headline')}
      subtext={t('features.onboarding.slides.studentOnly.subtext')}
      icon="graduation-cap"
    />
  );
};
