import { useQuery } from '@tanstack/react-query';
import type { RejectedImagesResponse } from '@/src/types/user';
import { getRejectedImages } from '../apis/photo-management';

export const REJECTED_IMAGES_KEY = ['profile', 'images', 'rejected'] as const;

export const useRejectedImages = () => {
  return useQuery<RejectedImagesResponse>({
    queryKey: REJECTED_IMAGES_KEY,
    queryFn: getRejectedImages,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
