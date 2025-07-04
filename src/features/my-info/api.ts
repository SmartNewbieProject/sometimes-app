import { axiosClient } from '@/src/shared/libs';
import type { PreferenceOption } from '@/src/types/user';

export type Preferences = {
	typeId: string;
	options: PreferenceOption[];
};

export const getSelfPreferenceOptions = (): Promise<Preferences[]> =>
	axiosClient.get('/preferences');
