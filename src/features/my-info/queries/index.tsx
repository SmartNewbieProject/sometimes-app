import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getSelfPreferenceOptions } from '../api';

export enum PreferenceKeys {
	DRINKING = 'DRINKING',
	SMOKING = 'SMOKING',
	INTEREST = 'INTEREST',
	DATING_STYLE = 'DATING_STYLE',
	MBTI = 'MBTI',
	MILITARY_STATUS = 'MILITARY_STATUS_MALE',
	PERSONALITY = 'PERSONALITY',
	TATTOO = 'TATTOO',
}

// typeName을 언어별로 매핑
export const PreferenceTypeNameMap: Record<PreferenceKeys, { ko: string; ja: string; en: string }> =
	{
		[PreferenceKeys.DRINKING]: { ko: '음주 선호도', ja: 'お酒', en: 'Drinking' },
		[PreferenceKeys.SMOKING]: { ko: '흡연 선호도', ja: 'タバコ', en: 'Smoking' },
		[PreferenceKeys.INTEREST]: { ko: '관심사', ja: '趣味', en: 'Interest' },
		[PreferenceKeys.DATING_STYLE]: { ko: '연애 스타일', ja: '恋愛スタイル', en: 'Dating Style' },
		[PreferenceKeys.MBTI]: { ko: 'MBTI 유형', ja: 'MBTI', en: 'MBTI' },
		[PreferenceKeys.MILITARY_STATUS]: { ko: '군필 여부', ja: '軍歴', en: 'Military Status' },
		[PreferenceKeys.PERSONALITY]: { ko: '성격', ja: '性格', en: 'Personality' },
		[PreferenceKeys.TATTOO]: { ko: '문신 선호도', ja: 'タトゥー', en: 'Tattoo' },
	};

// 현재 언어에 맞는 typeName 목록을 반환
export const getTypeNamesForLocale = (key: PreferenceKeys, locale: string): string[] => {
	const map = PreferenceTypeNameMap[key];
	// 현재 언어의 typeName을 우선으로, 모든 가능한 typeName을 반환 (fallback)
	if (locale.startsWith('ja')) {
		return [map.ja, map.ko, map.en];
	} else if (locale.startsWith('ko')) {
		return [map.ko, map.ja, map.en];
	} else {
		return [map.en, map.ko, map.ja];
	}
};

/**
 * typeKey를 우선적으로 사용하여 preference를 찾는 헬퍼 함수
 * typeKey가 없으면 typeName으로 fallback (하위 호환성)
 */
export const findPreferenceByType = (
	preferences: Array<{ typeKey?: string; typeName: string }>,
	preferenceKey: PreferenceKeys,
	locale: string,
): any => {
	// 1순위: typeKey로 매칭 (locale-independent)
	const byTypeKey = preferences.find((item) => item?.typeKey === preferenceKey);
	if (byTypeKey) {
		return byTypeKey;
	}

	// 2순위: typeName으로 fallback (legacy 지원)
	const typeNames = getTypeNamesForLocale(preferenceKey, locale);
	return preferences.find((item) => typeNames.includes(item?.typeName));
};

export const usePreferenceOptionsQuery = () =>
	useQuery({
		queryKey: ['self-preference-options'],
		queryFn: () => getSelfPreferenceOptions(),
		placeholderData: [
			{
				typeCode: '',
				typeName: '',
				options: [],
			},
		],
	});
