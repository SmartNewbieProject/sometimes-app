import { useQuery } from "@tanstack/react-query";
import { getMatchingHistoryList } from "../apis";

export const useMatchingHistoryList = () => {
  const { data: matchingHistoryList, ...queryProps } = useQuery({
    queryKey: ["matching-history-list"],
    queryFn: getMatchingHistoryList,
    staleTime: 0,
    gcTime: 0,
  });

  return { matchingHistoryList, ...queryProps };
};
