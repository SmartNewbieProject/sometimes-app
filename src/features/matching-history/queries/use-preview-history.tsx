import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPreviewHistory } from "../apis";
import type { PreviewMatchingHistory } from "../type";

export const usePreviewHistory = () => {
  const { data: previewHistory, ...queryProps } = useQuery({
    queryKey: ["preview-history"],
    queryFn: getPreviewHistory,
    initialData: { imageUrls: [], countOfPartner: 0 },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });

  return { previewHistory, ...queryProps };
};
