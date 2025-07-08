import { axiosClient } from '@/src/shared/libs';
import type { PreferenceOption } from '@/src/types/user';

export type Preferences = {
	typeName: string;
	options: PreferenceOption[];
};

export const getPreferenceOptions = (): Promise<Preferences[]> =>
	axiosClient.get('/preferences/partner/options');
