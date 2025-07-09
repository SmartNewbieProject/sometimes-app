import { axiosClient } from '@shared/libs';

type Body = {
	typeName: string;
	optionIds: string[];
};

export type PreferenceSaveBody = {
	preferences: Body[];
};

export const savePreferencesApi = async (body: PreferenceSaveBody) =>
	axiosClient.patch('/preferences/self', body);
