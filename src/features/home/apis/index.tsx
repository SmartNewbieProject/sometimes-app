import { axiosClient } from "@/src/shared/libs";

interface TotalMatchCountResponse {
  count: number;
}

export const getTotalMatchCount = (): Promise<TotalMatchCountResponse> => {
  return axiosClient.get('/api/matching/total-count');
};

type HomeApiService = {
  getTotalMatchCount: () => Promise<TotalMatchCountResponse>;
}

const apis: HomeApiService = {
  getTotalMatchCount,
};

export default apis;
