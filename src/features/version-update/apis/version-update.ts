import {axiosClient} from '@shared/libs';
import {VersionUpdateResponse} from '../types';

export const fetchLatestVersion = async (): Promise<VersionUpdateResponse | null> => {
  try {
    return {
      version: '1.1.1',
      id: '1',
      metadata: {
        description: [
          "뭐가 개선됨",
          "어쨋든 뭐가 갯너됨"
        ],
      },
      shouldUpdate: false,
    };
    return axiosClient.get<VersionUpdateResponse>('/api/version-updates/latest') as unknown as VersionUpdateResponse;
  } catch (error) {
    console.error('Failed to fetch latest version:', error);
    return null;
  }
};