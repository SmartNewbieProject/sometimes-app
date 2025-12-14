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

export const getLatestMatchingV2 = (): Promise<MatchDetails> =>
  axiosClient.get('/v2/matching')
    .then((result: unknown) => {
      const data = result as ServerMatchDetails;

      console.log('🔍 [API v2] Raw matching data:', data);

      const transformedData: MatchDetails = {
        ...data,
        endOfView: data.endOfView ? dayUtils.create(data.endOfView) : null,
        approvalStatus: data.approvalStatus,
        approvalMessage: data.approvalMessage,
        estimatedApprovalTime: data.estimatedApprovalTime,
        rejectionCategory: data.rejectionCategory,
        rejectionReason: data.rejectionReason,
      };

      console.log('🔍 [API v2] Transformed data:', {
        type: transformedData.type,
        approvalStatus: transformedData.approvalStatus,
        rejectionCategory: transformedData.rejectionCategory,
        untilNext: transformedData.untilNext
      });

      return transformedData;
    });
