import { axiosClient } from "@/src/shared/libs";

export interface MatchReason {
  title: string;
  description: string;
  category?: string;
}

export type MatchReasonsResponse =
  | {
      status: 'ready';
      reasons: MatchReason[];
      narrative: string;
    }
  | {
      status: 'generating';
      reasons?: never;
      narrative?: never;
    };

export const getMatchReasons = async (
  connectionId: string
): Promise<MatchReasonsResponse> => {
  return axiosClient.get(`/v2/matching/reasons/${connectionId}`);
};

