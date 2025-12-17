import {useQuery} from "@tanstack/react-query";
import apis from '../api';

const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7; // 7일

export const useFeatureCost = () => {
  const { data: featureCosts, isLoading: featureLoading } = useQuery({
    queryKey: ['feature-costs'],
    queryFn: apis.getFeatureCosts,
    staleTime: ONE_WEEK_MS,
    gcTime: ONE_WEEK_MS,
    refetchOnMount: false,
  });

  return { featureCosts, featureLoading };
};
