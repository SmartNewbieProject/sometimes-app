import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { getILiked } from "../api";

function useILikedQuery() {
  const { isAuthorized } = useAuth();
  const { data, ...props } = useQuery({
    queryKey: ["liked", "of-me"],
    queryFn: getILiked,
    refetchInterval: 1 * 60 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 0,
    enabled: isAuthorized,
  });
  return { data, ...props };
}

export default useILikedQuery;
