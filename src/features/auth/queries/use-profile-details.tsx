import { axiosClient } from "@/src/shared/libs";
import { UserProfile } from "@/src/types/user";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

const getProfileDetails = (): Promise<UserProfile> =>
  axiosClient.get('/profile');

export function useProfileDetailsQuery(isAuthorized: boolean) {
  return useQuery({
    enabled: isAuthorized,
    queryKey: ['my-profile-details'],
    queryFn: () => {
      return getProfileDetails();
    },
  });
}
