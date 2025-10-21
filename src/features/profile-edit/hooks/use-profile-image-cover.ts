import { useQuery } from "@tanstack/react-query";
import {
  getProfileImageReviewStatus,
  type ProfileImageReviewStatusResp,
} from "@/src/features/mypage/apis";

export function useProfileImageCover() {
  const query = useQuery<ProfileImageReviewStatusResp>({
    queryKey: ["profile-image-review-status"],
    queryFn: getProfileImageReviewStatus,
    staleTime: 60_000,
  });

  const isCoverVisible = (query.data?.reviewStatus ?? "none") === "pending";

  return {
    isCoverVisible,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    raw: query.data,
  };
}
