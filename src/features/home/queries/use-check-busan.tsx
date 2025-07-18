import {useQuery} from '@tanstack/react-query';
import {checkBusan} from '../apis';

export const useCheckBusanQuery = () => {
  return useQuery({
    queryKey: ['check-busan'],
    queryFn: checkBusan,
  });
};