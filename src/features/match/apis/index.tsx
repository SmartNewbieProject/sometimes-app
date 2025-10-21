import { axiosClient } from "@/src/shared/libs";
import type { UserProfile } from "@/src/types/user";

const getPartnerByMatchId = async (matchId: string): Promise<UserProfile> =>
  axiosClient.get(`/matching/history/${matchId}`);

const matchHistoryApis = {
  getPartnerByMatchId,
};

export { matchHistoryApis };
