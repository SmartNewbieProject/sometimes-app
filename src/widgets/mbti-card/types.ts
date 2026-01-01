import type { ViewStyle } from 'react-native';

export type MBTIType =
  | 'ISTJ'
  | 'ISFJ'
  | 'INFJ'
  | 'INTJ'
  | 'ISTP'
  | 'ISFP'
  | 'INFP'
  | 'INTP'
  | 'ESTP'
  | 'ESFP'
  | 'ENFP'
  | 'ENTP'
  | 'ESTJ'
  | 'ESFJ'
  | 'ENFJ'
  | 'ENTJ';

export interface MBTIData {
  type: MBTIType;
  i18nKey: string;
  compatibility: [MBTIType, MBTIType];
  iconPath: string;
}

export interface MBTICardProps {
  mbti: MBTIType | null | undefined;
  showCompatibility?: boolean;
  onCompatibilityPress?: (type: MBTIType) => void;
  style?: ViewStyle;
}
