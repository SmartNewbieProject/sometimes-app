import { axiosClient } from "@shared/libs";
import type {
  MatchingDetail,
  MatchingHistoryList,
  PreviewMatchingHistory,
} from "../type";
export const getMatchingHistory = (): Promise<MatchingHistoryList> => {
  // 임시 경로 (변경 가능)
  return axiosClient.get("/matching-history");
};

export const getPreviewHistory = (): Promise<PreviewMatchingHistory> => {
  return axiosClient.get("/matching/history/previews");
};
