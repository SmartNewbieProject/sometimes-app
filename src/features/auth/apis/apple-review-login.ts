import {AppleReviewLoginRequest, AppleReviewLoginResponse} from "../types";
import {axiosClient} from "@shared/libs";

export async function appleReviewLogin(
    data: AppleReviewLoginRequest
): Promise<AppleReviewLoginResponse> {
  return await axiosClient.post<AppleReviewLoginResponse>(
      "/auth/login/apple",
      data
  ) as unknown as AppleReviewLoginResponse;
}
