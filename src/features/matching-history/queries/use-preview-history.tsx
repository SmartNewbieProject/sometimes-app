import { useQuery } from "@tanstack/react-query";
import { getPreviewHistory } from "../apis";
import type { PreviewMatchingHistory } from "../type";

export const usePreviewHistory = () => {
  const { data: previewHistory, ...queryProps } = useQuery({
    queryKey: ["preview-history"],
    queryFn: getPreviewHistory,
    initialData: { imageUrls: [], countOfPartner: 0 },
    staleTime: 0,
    gcTime: 0,
  });

  return { previewHistory, ...queryProps };
};
