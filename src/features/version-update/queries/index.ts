import {useQuery} from '@tanstack/react-query';
import {fetchLatestVersion} from '../apis/version-update';

export const useLatestVersionQuery = () => {
  return useQuery({
    queryKey: ['version-update', 'latest'],
    queryFn: fetchLatestVersion,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};