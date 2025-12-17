import { useTranslation } from 'react-i18next';
import { SlideContainer } from './slide-container';
import type { SlideComponent } from '../types';

export const SlideRefund: SlideComponent = () => {
  const { t } = useTranslation();

  return (
    <SlideContainer
      headline={t('features.onboarding.slides.refund.headline')}
      subtext={t('features.onboarding.slides.refund.subtext')}
      icon="rotate-left"
    />
  );
};
