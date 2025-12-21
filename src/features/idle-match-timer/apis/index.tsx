import { axiosClient, dayUtils } from "@/src/shared/libs";
import type { MatchDetails, ServerMatchDetails } from "../types";
import { devLogWithTag } from "@/src/shared/utils";

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

      devLogWithTag('API', 'Matching:', {
        id: data.id,
        type: data.type,
        untilNext: data.untilNext,
      });

      const transformedData: MatchDetails = {
        ...data,
        endOfView: data.endOfView ? dayUtils.create(data.endOfView) : null,
      };

      return transformedData;
    });

export const getLatestMatchingV2 = (): Promise<MatchDetails> =>
  axiosClient.get('/v2/matching')
    .then((result: unknown) => {
      const data = result as ServerMatchDetails;

      const transformedData: MatchDetails = {
        ...data,
        endOfView: data.endOfView ? dayUtils.create(data.endOfView) : null,
        approvalStatus: data.approvalStatus,
        approvalMessage: data.approvalMessage,
        estimatedApprovalTime: data.estimatedApprovalTime,
        rejectionCategory: data.rejectionCategory,
        rejectionReason: data.rejectionReason,
      };

      devLogWithTag('API v2', 'Matching:', {
        id: transformedData.id,
        type: transformedData.type,
        approvalStatus: transformedData.approvalStatus,
        untilNext: transformedData.untilNext,
      });

      return transformedData;
    });
