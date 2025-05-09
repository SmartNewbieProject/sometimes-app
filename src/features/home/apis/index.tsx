import { axiosClient } from "@/src/shared/libs";

interface TotalMatchCountResponse {
  count: number;
}

export const getTotalMatchCount = (): Promise<TotalMatchCountResponse> =>
  axiosClient.get('/matching/total-count');

export const checkPreferenceFill = async (): Promise<boolean> =>
  axiosClient.get('/preferences/check/fill');

export const getTotalUserCount = (): Promise<number> =>
  axiosClient.get('/stats/total-user-count');

type HomeApiService = {
  getTotalMatchCount: () => Promise<TotalMatchCountResponse>;
  checkPreferenceFill: () => Promise<boolean>;
  getTotalUserCount: () => Promise<number>;
}

const apis: HomeApiService = {
  getTotalMatchCount,
  checkPreferenceFill,
  getTotalUserCount,
};

export default apis;
