import { useMutation } from "@tanstack/react-query";
import { confirmProfileImageReview } from "@/src/features/mypage/apis";

export function useConfirmProfileImageReview() {
  return useMutation({
    mutationFn: confirmProfileImageReview,
  });
}
