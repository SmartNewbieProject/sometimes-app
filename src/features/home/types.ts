import type { ImageSourcePropType } from "react-native";

export type BannerPosition = 'home' | 'moment';
export type BannerActionType = 'internal' | 'external' | null;

export interface BannerResponse {
  id: string;
  imageUrl: string;
  actionUrl: string | null;
  actionType: BannerActionType;
  position: BannerPosition;
  order: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface NavigationMenuItem {
  id: string;
  title: string;
  description: string;
  backgroundImageUrl?: string | ImageSourcePropType;
  width?: number;
  onPress: () => void;
}

export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  itemHeight: number;
  itemsPerRow: number;
}

export interface SlideItem {
  id: string;
  imageUrl: string | ImageSourcePropType;
  link?: string;
  externalLink?: string;
}

export interface ImageSlideProps {
  items: SlideItem[];
  autoPlayInterval?: number;
  width?: number;
  height: number;
}

export interface HeaderProps {
  title?: string;
}
