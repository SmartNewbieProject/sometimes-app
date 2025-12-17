import { useQuery } from '@tanstack/react-query';
import type { ManagementImagesResponse } from '@/src/types/user';
import { getManagementSlots } from '../apis/photo-management';

export const MANAGEMENT_SLOTS_KEY = ['profile', 'images', 'management'] as const;

export const useManagementSlots = (enabled: boolean = true) => {
  return useQuery<ManagementImagesResponse>({
    queryKey: MANAGEMENT_SLOTS_KEY,
    queryFn: getManagementSlots,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
