import {axiosClient} from '@shared/libs';
import {VersionUpdateResponse} from '../types';

export const fetchLatestVersion = async (): Promise<VersionUpdateResponse | null> => {
  try {
    return axiosClient.get<VersionUpdateResponse>('/version-updates/latest') as unknown as VersionUpdateResponse;
  } catch (error) {
    console.error('Failed to fetch latest version:', error);
    return null;
  }
};