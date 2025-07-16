import { axiosClient } from '@shared/libs';

type Body = {
	typeName: string;
	optionIds: string[];
};

export type PreferenceSaveBody = {
	preferences: Body[];
	additional: {
		goodMbti: string;
		badMbti: string;
	};
};

export const savePreferencesApi = async (body: PreferenceSaveBody) =>
	axiosClient.patch('/preferences/partner', body);
