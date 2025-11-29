import { useQuery } from "@tanstack/react-query";
import { getMatchReasons } from "../apis";

export const useMatchReasonsQuery = (connectionId: string | undefined) => {
  return useQuery({
    queryKey: ["matchReasons", connectionId],
    queryFn: () => getMatchReasons(connectionId!),
    enabled: !!connectionId,
    staleTime: 1000 * 60 * 60, // 1시간
  });
};

