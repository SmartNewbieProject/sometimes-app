import { axiosClient } from "@shared/libs";
import type { MatchingDetail, MatchingHistoryList } from "../type";
export const getMatchingHistory = (): Promise<MatchingHistoryList> => {
  // 임시 경로 (변경 가능)
  return axiosClient.get("/matching-history");
};

export const getLikeHistory = (id: string): Promise<MatchingDetail> => {
  // 임시 경로 (변경 가능)
  return axiosClient.get(`/matching-history/${id}`);
};
