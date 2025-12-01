import axiosClient from "@/src/shared/libs/axios";

export interface FeatureFlagResponse {
  featureName: string;
  enabled: boolean;
  description?: string;
}

export const checkSomemateEnabled = async (): Promise<FeatureFlagResponse> => {
  return axiosClient.get("/feature-flags/somemate");
};

