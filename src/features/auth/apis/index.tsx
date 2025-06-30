import type { MyDetails } from "@/src/types/user";
import type { PassLoginResponse } from "@/src/types/auth";
import { axiosClient } from "@shared/libs";

export const getMySimpleDetails = () => axiosClient.get('/user');

export const checkExistsInstagram = (instagramId: string): Promise<{ exists: boolean }> =>
  axiosClient.post('/auth/check/instagram', { instagramId });

export const getMyDetails = (): Promise<MyDetails> =>
  axiosClient.get('/user/details');

export const passLogin = (impUid: string): Promise<PassLoginResponse> =>
  axiosClient.post('/auth/pass-login', { impUid });
