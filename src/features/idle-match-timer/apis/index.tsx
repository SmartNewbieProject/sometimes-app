import { axiosClient, dayUtils } from "@/src/shared/libs";
import type { MatchDetails, ServerMatchDetails } from "../types";

export const getNextMatchingDate = () =>
  axiosClient.get('/matching/next-date')
    .then((res) => {
      const { nextMatchingDate } = res as unknown as { nextMatchingDate: string };
      return {
        nextMatchingDate: dayUtils.create(nextMatchingDate),
      };
    });


export const getLatestMatching = (): Promise<MatchDetails> =>
  axiosClient.get('/matching')
    .then((result: unknown) => {
      const data = result as ServerMatchDetails;
      return {
        ...data,
        endOfView: data.endOfView && dayUtils.create(data.endOfView),
      } as MatchDetails;
    });
