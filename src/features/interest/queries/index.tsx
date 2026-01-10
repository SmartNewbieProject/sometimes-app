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
