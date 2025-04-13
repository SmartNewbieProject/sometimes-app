import { axiosClient } from "@/src/shared/libs";
import { UserProfile } from "@/src/types/user";
import { useSuspenseQuery } from "@tanstack/react-query";

const getProfileDetails = (): Promise<UserProfile> =>
  axiosClient.get('/profile');

export function useProfileDetailsQuery(isAuthorized: boolean) {
  return useSuspenseQuery({
    queryKey: ['my-profile-details'],
    queryFn: () => {
      if (!isAuthorized) {
        return null;
      }
      return getProfileDetails();
    },
  });
}
