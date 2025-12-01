import { useQuery } from "@tanstack/react-query";
import { checkSomemateEnabled, FeatureFlagResponse } from "../apis/feature-flags";

export const SOMEMATE_ENABLED_KEY = ["somemate", "enabled"] as const;

export const useSomemateEnabled = () => {
  return useQuery<FeatureFlagResponse>({
    queryKey: SOMEMATE_ENABLED_KEY,
    queryFn: checkSomemateEnabled,
    staleTime: 1000 * 60 * 5,
    select: (data) => ({
      ...data,
      enabled: data.enabled,
    }),
  });
};

