import { isJapanese as checkIsJapanese } from '@shared/libs';
import { useMemo } from 'react';

export type FontWeight =
	| 'thin'
	| 'extralight'
	| 'light'
	| 'regular'
	| 'medium'
	| 'semibold'
	| 'bold'
	| 'extrabold'
	| 'black';

export const useAppFont = (weight: FontWeight = 'regular') => {
	const isJapanese = checkIsJapanese();

	const fontFamily = useMemo(() => {
		if (isJapanese) {
			switch (weight) {
				case 'thin':
				case 'extralight':
				case 'light':
				case 'regular':
					return 'MPLUS1p-Regular';
				case 'medium':
					return 'MPLUS1p-Medium';
				case 'semibold':
				case 'bold':
				case 'extrabold':
				case 'black':
					return 'MPLUS1p-Bold';
				default:
					return 'MPLUS1p-Regular';
			}
		}

		switch (weight) {
			case 'thin':
			case 'extralight':
			case 'light':
			case 'regular':
				return 'Pretendard-Regular';
			case 'medium':
				return 'Pretendard-Medium';
			case 'semibold':
				return 'Pretendard-SemiBold';
			case 'bold':
				return 'Pretendard-Bold';
			case 'extrabold':
			case 'black':
				return 'Pretendard-ExtraBold';
			default:
				return 'Pretendard-Regular';
		}
	}, [isJapanese, weight]);

	return fontFamily;
};
