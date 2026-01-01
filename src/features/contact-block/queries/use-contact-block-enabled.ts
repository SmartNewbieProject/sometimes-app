import { useQuery } from "@tanstack/react-query";
import { checkContactBlockEnabled } from "../apis/feature-flags";
import { FeatureFlagResponse } from "@/src/features/somemate/apis/feature-flags";

export const CONTACT_BLOCK_ENABLED_KEY = ["contact-block", "enabled"] as const;

export const useContactBlockEnabled = () => {
  return useQuery<FeatureFlagResponse>({
    queryKey: CONTACT_BLOCK_ENABLED_KEY,
    queryFn: checkContactBlockEnabled,
    staleTime: 1000 * 60 * 5,
  });
};
