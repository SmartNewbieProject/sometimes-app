import { useQuery } from "@tanstack/react-query";
import { getPreviewHistory } from "../apis";

export const usePreviewHistory = () => {
  const { data: previewHistory, ...queryProps } = useQuery({
    queryKey: ["preview-history"],
    queryFn: getPreviewHistory,
    staleTime: 0,
  });

  return { previewHistory, ...queryProps };
};
