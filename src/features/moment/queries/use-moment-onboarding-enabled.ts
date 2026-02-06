import { useQuery } from "@tanstack/react-query";
import { checkMomentOnboardingEnabled } from "../apis/feature-flags";
import { FeatureFlagResponse } from "@/src/features/somemate/apis/feature-flags";

export const MOMENT_ONBOARDING_ENABLED_KEY = ["moment-onboarding", "enabled"] as const;

export const useMomentOnboardingEnabled = () => {
  return useQuery<FeatureFlagResponse>({
    queryKey: MOMENT_ONBOARDING_ENABLED_KEY,
    queryFn: checkMomentOnboardingEnabled,
    staleTime: 1000 * 60 * 5,
    select: (data) => ({
      ...data,
      enabled: data.enabled,
    }),
  });
};
