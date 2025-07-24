import { axiosClient } from "@shared/libs";
import type { MatchingHistoryDetails, PreviewMatchingHistory } from "../type";

export const getPreviewHistory = (): Promise<PreviewMatchingHistory> => {
  return axiosClient.get("/matching/history/previews");
};

export const getMatchingHistoryList = (): Promise<MatchingHistoryDetails[]> => {
  return axiosClient.get("/matching/history/list");
};
