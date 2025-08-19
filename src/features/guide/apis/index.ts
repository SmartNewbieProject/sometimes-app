import { axiosClient } from '@/src/shared/libs';

export const getMatchingHasFirst = (): Promise<boolean> => {
	return axiosClient.get('/matching/has-first');
};
