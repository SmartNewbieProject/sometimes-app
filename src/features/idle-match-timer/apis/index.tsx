import { axiosClient, dayUtils } from "@/src/shared/libs";

export const getNextMatchingDate = () => 
  axiosClient.get('/matching/next-date')
    .then((res) => {
      const { nextMatchingDate } = res as unknown as { nextMatchingDate: string };
      return {
        nextMatchingDate: dayUtils.create(nextMatchingDate),
      };
    });
    