import type { MyDetails } from "@/src/types/user";
import { axiosClient } from "@shared/libs";
import type { PassLoginResponse } from "@/src/auth/dto/pass-login.dto";

export const getMySimpleDetails = () => axiosClient.get('/user');

export const checkExistsInstagram = (instagramId: string): Promise<{ exists: boolean }> =>
  axiosClient.post('/auth/check/instagram', { instagramId });

export const getMyDetails = (): Promise<MyDetails> =>
  axiosClient.get('/user/details');

export const passLogin = (impUid: string): Promise<PassLoginResponse> =>
  axiosClient.post('/auth/pass-login', { impUid });
