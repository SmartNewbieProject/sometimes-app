import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/src/shared/libs";
import type { UserProfile } from "@/src/types/user";

const getMyDetails = (): Promise<UserProfile> => {
  return axiosClient.get('/profile');
};

export const useMyDetailsQuery = (enabled: boolean) => {
  const { data, ...props } = useQuery({
    queryKey: ['my-details'],
    queryFn: getMyDetails,
    enabled,
  });

  return { my: data, ...props };
};
