export interface SlideItem {
  id: string;
  imageUrl: string | number;
  link?: string;
  externalLink?: string;
}

export interface ImageSlideProps {
  items: SlideItem[];
  autoPlayInterval?: number;
  width: '100%';
  height: number;
}

export interface NavigationMenuItem {
  id: string;
  title: React.ReactNode;
  description: string;
  backgroundImageUrl?: string;
  onPress: () => void;
  width?: number;
}

export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  itemHeight: number;
  itemsPerRow: number;
}

export interface HeaderProps {
  // Moment 이미지 컴포넌트 중앙 배치
}

export interface BottomNavigationItem {
  name: 'home' | 'community' | 'chat' | 'moment' | 'my';
  label: string;
  path: string;
  icon: {
    selected: React.ReactNode;
    unselected: React.ReactNode;
  };
}