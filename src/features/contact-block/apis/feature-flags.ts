import axiosClient from "@/src/shared/libs/axios";
import { FeatureFlagResponse } from "@/src/features/somemate/apis/feature-flags";

export const checkContactBlockEnabled = async (): Promise<FeatureFlagResponse> => {
  return axiosClient.get("/feature-flags/contact-block");
};
