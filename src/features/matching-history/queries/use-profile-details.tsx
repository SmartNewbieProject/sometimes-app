import { axiosClient } from "@/src/shared/libs";
import { UserProfile } from "@/src/types/user";
import { useQuery } from "@tanstack/react-query";

const getProfileDetails = (): Promise<UserProfile> =>
  axiosClient.get('/profile');

export function useProfileDetailsQuery(authToken: string | null) {
  return useQuery({
    enabled: !!authToken,
    queryKey: ['my-profile-details', authToken],
    queryFn: () => {
      return getProfileDetails();
    },
  });
};
