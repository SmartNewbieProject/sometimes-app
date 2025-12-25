import { axiosClient } from "@/src/shared/libs";

export interface MatchReason {
  title: string;
  description: string;
  category?: string;
}

export interface MatchReasonsResponse {
  reasons: MatchReason[];
}

export const getMatchReasons = async (
  connectionId: string
): Promise<MatchReasonsResponse> => {
  return axiosClient.get(`/v2/matching/reasons/${connectionId}`);
};

