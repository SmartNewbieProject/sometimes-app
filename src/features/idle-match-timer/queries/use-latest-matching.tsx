import { useQuery } from "@tanstack/react-query";
import { getLatestMatching } from "../apis";

export const useLatestMatching = () => {
  const { data: match, status, fetchStatus, ...queryProps } = useQuery({
    queryKey: ["latest-matching"],
    queryFn: getLatestMatching,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const isPending = status === "pending";
  const isFetchingData = fetchStatus === "fetching";

  console.log('🔍 [Query] Match data updated:', {
    match,
    status,
    fetchStatus,
    isPending,
    isFetchingData,
    isError: queryProps.isError,
  });

  return { match, status, fetchStatus, isPending, isFetchingData, ...queryProps };
};
