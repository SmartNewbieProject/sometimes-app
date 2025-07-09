import { axiosClient } from '@/src/shared/libs';
import type { PreferenceOption } from '@/src/types/user';

export type Preferences = {
	typeName: string;
	options: PreferenceOption[];
};

export const getSelfPreferenceOptions = (): Promise<Preferences[]> =>
	axiosClient.get('/preferences/self/options');
