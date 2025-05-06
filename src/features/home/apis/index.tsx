import { axiosClient } from "@/src/shared/libs";

interface TotalMatchCountResponse {
  count: number;
}

export const getTotalMatchCount = (): Promise<TotalMatchCountResponse> =>
  axiosClient.get('/matching/total-count');

export const checkPreferenceFill = async (): Promise<boolean> =>
  axiosClient.get('/preferences/check/fill');

type HomeApiService = {
  getTotalMatchCount: () => Promise<TotalMatchCountResponse>;
  checkPreferenceFill: () => Promise<boolean>;
}

const apis: HomeApiService = {
  getTotalMatchCount,
  checkPreferenceFill,
};

export default apis;
