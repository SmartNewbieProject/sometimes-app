export interface SlideData {
  id: number;
  title: string;
  headline: string;
  subtext: string;
  icon?: string;
  hasCustomAnimation?: boolean;
}

export interface OnboardingStorage {
  hasSeenOnboarding: boolean;
  completedAt: string;
}

export type SlideComponent = React.FC<{
  isActive: boolean;
  index: number;
}>;

export interface ProgressBarProps {
  currentIndex: number;
  totalSlides: number;
}

export interface NavigationButtonsProps {
  currentIndex: number;
  totalSlides: number;
  onNext: () => void;
  isTransitioning: boolean;
}

export interface SkipButtonProps {
  onSkip: () => void;
}

export interface SlideContainerProps {
  headline: string;
  subtext: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  children?: React.ReactNode;
}
