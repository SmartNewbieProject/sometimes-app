import { useQuery } from "@tanstack/react-query";
import { checkMyMomentEnabled } from "../apis/feature-flags";
import { FeatureFlagResponse } from "@/src/features/somemate/apis/feature-flags";

export const MY_MOMENT_ENABLED_KEY = ["my-moment", "enabled"] as const;

export const useMyMomentEnabled = () => {
  return useQuery<FeatureFlagResponse>({
    queryKey: MY_MOMENT_ENABLED_KEY,
    queryFn: checkMyMomentEnabled,
    staleTime: 1000 * 60 * 5,
    select: (data) => ({
      ...data,
      enabled: data.enabled,
    }),
  });
};
