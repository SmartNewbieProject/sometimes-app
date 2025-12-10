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

      console.log('🔍 [API] Raw matching data:', data);

      const transformedData: MatchDetails = {
        ...data,
        endOfView: data.endOfView ? dayUtils.create(data.endOfView) : null,
      };

      console.log('🔍 [API] Transformed untilNext:', {
        original: data.untilNext,
        processed: transformedData.untilNext
      });

      return transformedData;
    });
