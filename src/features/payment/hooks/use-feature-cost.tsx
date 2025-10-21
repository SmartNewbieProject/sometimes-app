import {useQuery} from "@tanstack/react-query";
import apis from '../api';


export const useFeatureCost = () => {
  const { data: featureCosts, isLoading: featureLoading } = useQuery({
    queryKey: ['feature-costs'],
    queryFn: apis.getFeatureCosts,
  });

  return { featureCosts, featureLoading };
};
