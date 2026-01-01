import type { MBTIType } from './types';
import type { ImageSourcePropType } from 'react-native';

const MBTI_ICONS: Record<MBTIType, ImageSourcePropType> = {
  ISTJ: require('@/assets/images/mbti/istj.png'),
  ISFJ: require('@/assets/images/mbti/isfj.png'),
  INFJ: require('@/assets/images/mbti/infj.png'),
  INTJ: require('@/assets/images/mbti/intj.png'),
  ISTP: require('@/assets/images/mbti/istp.png'),
  ISFP: require('@/assets/images/mbti/isfp.png'),
  INFP: require('@/assets/images/mbti/infp.png'),
  INTP: require('@/assets/images/mbti/intp.png'),
  ESTP: require('@/assets/images/mbti/estp.png'),
  ESFP: require('@/assets/images/mbti/esfp.png'),
  ENFP: require('@/assets/images/mbti/enfp.png'),
  ENTP: require('@/assets/images/mbti/entp.png'),
  ESTJ: require('@/assets/images/mbti/estj.png'),
  ESFJ: require('@/assets/images/mbti/esfj.png'),
  ENFJ: require('@/assets/images/mbti/enfj.png'),
  ENTJ: require('@/assets/images/mbti/entj.png'),
};

export const getMBTIIcon = (type: MBTIType): ImageSourcePropType => {
  return MBTI_ICONS[type];
};
