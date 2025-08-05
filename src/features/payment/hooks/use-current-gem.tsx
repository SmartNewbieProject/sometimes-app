import { useQuery } from '@tanstack/react-query';
import paymentApis from '../api';

export const useCurrentGem = () => {
  return useQuery({
    queryKey: ['gem', 'current'],
    queryFn: paymentApis.getCurrentGem,
    initialData: {
      totalGem: 0,
    }
  });
};
