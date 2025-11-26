export interface MomentSlide {
  id: string;
  imageUrl: string | number;
  imageType: 'local' | 'remote';
  title?: string;
  link?: string;
  externalLink?: string;
  order?: number; // 슬라이드 표시 순서 (낮을수록 먼저 표시)
}

export interface MomentSlidesProps {
  items: MomentSlide[];
  autoPlayInterval?: number;
  height: number;
}

export interface MomentNavigationItem {
  id: string;
  titleComponent: React.ReactNode;
  description: string;
  backgroundImageUrl?: string | number;
  imageSize?: number; // Custom image size (default: 60)
  isReady?: boolean; // Whether the feature is ready (default: true)
  readyMessage?: string; // Message to display when not ready
  onPress: () => void;
  width?: number;
}

export type MomentNavigationHeight = 'lg' | 'md';

export interface MomentNavigationProps {
  items: MomentNavigationItem[];
  itemHeight: MomentNavigationHeight;
  itemsPerRow: number;
}

export interface MomentReport {
  id: string;
  weekNumber: number;
  year: number;
  keywords: string[];
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string;
  generatedAt: string;
}

export interface MomentReportResponse {
  success: boolean;
  message: string;
  data: MomentReport | null;
}