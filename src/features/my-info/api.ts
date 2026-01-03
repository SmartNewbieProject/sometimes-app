import { axiosClient } from '@/src/shared/libs';
import type { PreferenceOption } from '@/src/types/user';

export type { PreferenceOption };

export type Preferences = {
	typeCode: string;
	typeName: string;
	options: PreferenceOption[];
};

export type SelectedPreferences = {
	typeCode?: string;
	typeName: string;
	selectedOptions: PreferenceOption[];
};

export const getSelfPreferenceOptions = (): Promise<Preferences[]> =>
	axiosClient.get('/preferences/self/options');
