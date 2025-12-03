import { useQuery } from "@tanstack/react-query";
import { getLatestMatching } from "../apis";

export const useLatestMatching = () => {
  const { data: match, ...queryProps } = useQuery({
    queryKey: ["latest-matching"],
    queryFn: getLatestMatching,
    staleTime: 30 * 1000, // 30초 동안 데이터는 신선하게 유지
    gcTime: 5 * 60 * 1000, // 5분간 캐시 보관
    refetchInterval: 60 * 1000, // 1분마다 자동 리프레시 (서버 시간 동기화)
    refetchIntervalInBackground: false, // 백그라운드에서는 리프레시하지 않음
    refetchOnWindowFocus: true, // 화면 포커스 시 리프레시
    retry: 3, // 실패 시 3번 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });

  console.log('🔍 [Query] Match data updated:', {
    match: match,
    isLoading: queryProps.isLoading,
    isFetching: queryProps.isFetching,
    staleTime: '30s',
    refetchInterval: '60s'
  });

  return { match, ...queryProps };
};
