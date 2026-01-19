import type { MBTIType } from './types';
import type { ImageSourcePropType } from 'react-native';

const MBTI_ICONS: Record<MBTIType, ImageSourcePropType> = {
	ISTJ: require('@/assets/images/mbti/istj.webp'),
	ISFJ: require('@/assets/images/mbti/isfj.webp'),
	INFJ: require('@/assets/images/mbti/infj.webp'),
	INTJ: require('@/assets/images/mbti/intj.webp'),
	ISTP: require('@/assets/images/mbti/istp.webp'),
	ISFP: require('@/assets/images/mbti/isfp.webp'),
	INFP: require('@/assets/images/mbti/infp.webp'),
	INTP: require('@/assets/images/mbti/intp.webp'),
	ESTP: require('@/assets/images/mbti/estp.webp'),
	ESFP: require('@/assets/images/mbti/esfp.webp'),
	ENFP: require('@/assets/images/mbti/enfp.webp'),
	ENTP: require('@/assets/images/mbti/entp.webp'),
	ESTJ: require('@/assets/images/mbti/estj.webp'),
	ESFJ: require('@/assets/images/mbti/esfj.webp'),
	ENFJ: require('@/assets/images/mbti/enfj.webp'),
	ENTJ: require('@/assets/images/mbti/entj.webp'),
};

export const getMBTIIcon = (type: MBTIType): ImageSourcePropType => {
	return MBTI_ICONS[type];
};
