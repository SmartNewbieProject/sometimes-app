import { axiosClient } from '@shared/libs';
import type { VersionUpdateResponse } from '../types';

export const fetchLatestVersion = async (): Promise<VersionUpdateResponse | null> => {
	try {
		return axiosClient.get<VersionUpdateResponse>(
			'/admin/version-updates/latest',
		) as unknown as VersionUpdateResponse;
	} catch (error) {
		console.error('Failed to fetch latest version:', error);
		return null;
	}
};
