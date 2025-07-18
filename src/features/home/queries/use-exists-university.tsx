import {useQuery} from '@tanstack/react-query';
import {checkExistsUniversity} from '../apis';

export const useExistsUniversityQuery = () => {
  return useQuery({
    queryKey: ['exists-university'],
    queryFn: checkExistsUniversity,
  });
};