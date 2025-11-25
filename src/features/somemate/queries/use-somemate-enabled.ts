import { useQuery } from "@tanstack/react-query";
import { checkSomemateEnabled } from "../apis/feature-flags";

export const SOMEMATE_ENABLED_KEY = ["somemate", "enabled"] as const;

export const useSomemateEnabled = () => {
  return useQuery({
    queryKey: SOMEMATE_ENABLED_KEY,
    queryFn: checkSomemateEnabled,
    staleTime: 1000 * 60 * 5,
  });
};

