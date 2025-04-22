import { axiosClient } from "@shared/libs";

export const getMySimpleDetails = () => axiosClient.get('/api/user');

export const checkExistsInstagram = (instagramId: string): Promise<{ exists: boolean }> =>
  axiosClient.post(`/auth/check/instagram`, { instagramId });
