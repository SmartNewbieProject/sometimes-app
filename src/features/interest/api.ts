import { axiosClient } from '@/src/shared/libs';
import type { PreferenceOption } from '@/src/types/user';

export type { PreferenceOption };

export type Preferences = {
	typeCode: string;
	typeName: string;
	options: PreferenceOption[];
};

export const getPreferenceOptions = (): Promise<Preferences[]> =>
	axiosClient.get('/preferences/partner/options');
