export interface NavigationMenuItem {
  id: string;
  title: string;
  description: string;
  backgroundImageUrl: any;
  onPress: () => void;
}