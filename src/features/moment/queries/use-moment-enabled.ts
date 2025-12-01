import { useQuery } from "@tanstack/react-query";
import { checkMomentEnabled } from "../apis/feature-flags";
import { FeatureFlagResponse } from "@/src/features/somemate/apis/feature-flags";

export const MOMENT_ENABLED_KEY = ["moment", "enabled"] as const;

export const useMomentEnabled = () => {
  return useQuery<FeatureFlagResponse>({
    queryKey: MOMENT_ENABLED_KEY,
    queryFn: checkMomentEnabled,
    staleTime: 1000 * 60 * 5,
    select: (data) => ({
      ...data,
      enabled: data.enabled,
    }),
  });
};