import { useQuery } from "@tanstack/react-query";
import { getRouletteEligibility } from "../../api";
import type { RouletteEligibility } from "../../types";

export const ROULETTE_ELIGIBILITY_QUERY_KEY = [
  "events",
  "roulette",
  "eligibility",
];

export const useRouletteEligibility = () => {
  return useQuery<RouletteEligibility, Error>({
    queryKey: ROULETTE_ELIGIBILITY_QUERY_KEY,
    queryFn: getRouletteEligibility,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
