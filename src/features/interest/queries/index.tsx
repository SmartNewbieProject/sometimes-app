import { PreferenceOption } from '@/src/types/user';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { type Preferences, getPreferenceOptions } from '../api';

export enum PreferenceKeys {
	AGE = 'AGE_PREFERENCE',
	DRINKING = 'DRINKING',
	SMOKING = 'SMOKING',
	PERSONALITY = 'PERSONALITY',
	INTEREST = 'INTEREST',
	DATING_STYLE = 'DATING_STYLE',
	MILITARY_PREFERENCE = 'MILITARY_PREFERENCE_FEMALE',
	GOOD_MBTI = 'GOOD_MBTI',
	BAD_MBTI = 'BAD_MBTI',
	MILITARY_STATUS = 'MILITARY_STATUS_MALE',
	TATTOO = 'TATTOO',
}

export const PreferenceTypeNameMap: Record<
	PreferenceKeys,
	{ ko: string[]; ja: string[]; en: string[] }
> = {
	[PreferenceKeys.DRINKING]: {
		ko: ['음주', '음주 선호도'],
		ja: ['お酒'],
		en: ['Drinking', 'DRINKING'],
	},
	[PreferenceKeys.SMOKING]: {
		ko: ['흡연', '흡연 선호도'],
		ja: ['タバコ'],
		en: ['Smoking', 'SMOKING'],
	},
	[PreferenceKeys.TATTOO]: {
		ko: ['문신', '문신 선호도'],
		ja: ['タトゥー'],
		en: ['Tattoo', 'TATTOO'],
	},
	[PreferenceKeys.AGE]: {
		ko: ['나이', '희망 나이', '선호 나이대', '나이 선호도'],
		ja: ['希望の年齢', '年齢'],
		en: ['Age', 'AGE_PREFERENCE'],
	},
	[PreferenceKeys.PERSONALITY]: {
		ko: ['성격', '성격 유형'],
		ja: ['性格'],
		en: ['Personality', 'personality'],
	},
	[PreferenceKeys.MILITARY_PREFERENCE]: {
		ko: ['군필 여부', '병역'],
		ja: ['兵役'],
		en: ['Military', 'MILITARY_PREFERENCE_FEMALE'],
	},
	[PreferenceKeys.GOOD_MBTI]: {
		ko: ['좋아하는 MBTI'],
		ja: ['好きなMBTI'],
		en: ['Good MBTI', 'GOOD_MBTI'],
	},
	[PreferenceKeys.BAD_MBTI]: {
		ko: ['싫어하는 MBTI'],
		ja: ['嫌いなMBTI'],
		en: ['Bad MBTI', 'BAD_MBTI'],
	},
	[PreferenceKeys.INTEREST]: {
		ko: ['관심사'],
		ja: ['趣味'],
		en: ['Interest', 'INTEREST'],
	},
	[PreferenceKeys.DATING_STYLE]: {
		ko: ['연애 스타일'],
		ja: ['恋愛スタイル'],
		en: ['Dating Style', 'DATING_STYLE'],
	},
	[PreferenceKeys.MILITARY_STATUS]: {
		ko: ['군필 여부'],
		ja: ['兵役'],
		en: ['Military Status', 'MILITARY_STATUS_MALE'],
	},
};

export const getTypeNamesForLocale = (key: PreferenceKeys, locale: string): string[] => {
	const map = PreferenceTypeNameMap[key];
	if (!map) return [];

	if (locale.startsWith('ja')) {
		return [...map.ja, ...map.ko, ...map.en];
	}
	if (locale.startsWith('ko')) {
		return [...map.ko, ...map.ja, ...map.en];
	}
	return [...map.en, ...map.ko, ...map.ja];
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
	useQuery<Preferences[]>({
		queryKey: ['preference-options'],
		queryFn: () => getPreferenceOptions(),

		placeholderData: [
			{
				typeCode: '',
				typeName: '',
				options: [],
			},
		],
	});
