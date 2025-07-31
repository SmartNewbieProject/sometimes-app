import { useQuery } from '@tanstack/react-query';
import paymentApis from '../api';

export const useGemProducts = () => {
  return useQuery({
    queryKey: ['gem', 'products'],
    queryFn: paymentApis.getAllGemProducts,
  });
};
