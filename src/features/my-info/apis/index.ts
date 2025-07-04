import { axiosClient } from '@shared/libs';

type Body = {
	typeName: string;
	optionIds: string[];
};

export type PreferenceSaveBody = {
	data: Body[];
};

export const savePreferencesApi = async (body: PreferenceSaveBody) =>
	axiosClient.patch('/profile/preferences/self', body);
