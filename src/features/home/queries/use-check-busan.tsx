import {useQuery} from '@tanstack/react-query';
import {checkBusan} from '../apis';

export const useCheckBusanQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['check-busan'],
    queryFn: checkBusan,
    enabled,
  });
};