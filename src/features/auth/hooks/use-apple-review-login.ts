import { useMutation } from "@tanstack/react-query";
import { appleReviewLogin } from "../apis/apple-review-login";
import { AppleReviewLoginRequest } from "../types";

export function useAppleReviewLogin() {
  return useMutation({
    mutationFn: (data: AppleReviewLoginRequest) => appleReviewLogin(data),
    onSuccess: (response) => {
      // 토큰 저장이나 추가 처리 로직이 필요하다면 여기에 추가
      console.log("Apple review login successful:", response);
    },
    onError: (error) => {
      console.error("Apple review login failed:", error);
    },
  });
}