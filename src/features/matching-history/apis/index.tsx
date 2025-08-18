import { axiosClient } from "@shared/libs";
import type { MatchingHistoryDetails, PreviewMatchingHistory } from "../type";

export const getPreviewHistory = (): Promise<PreviewMatchingHistory> => {
  return axiosClient.get("/v2/matching/history/previews");
};

export const getMatchingHistoryList = (): Promise<MatchingHistoryDetails[]> => {
  return axiosClient.get("/v2/matching/history/list");
};

export const postUnlockProfile = (matchId: string) => {
  return axiosClient.post("/v2/matching/history/unlock", { matchId });
};
