import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import apis from "../apis";
import type { BannerPosition } from "../types";

export const useTotalMatchCountQuery = () => {
  const { isAuthorized } = useAuth();
  return useQuery({
    queryKey: ["total-match-count"],
    queryFn: apis.getTotalMatchCount,
    enabled: isAuthorized,
  });
};

export const useTotalUserCountQuery = () =>
  useQuery({
    queryKey: ["total-user-count"],
    queryFn: apis.getTotalUserCount,
  });

export const useCheckPreferenceFillQuery = () => {
  const { isAuthorized } = useAuth();
  return useQuery({
    queryKey: ["check-preference-fill"],
    queryFn: apis.checkPreferenceFill,
    staleTime: 0,
    gcTime: 0,
    enabled: isAuthorized,
  });
};

export const usePreferenceSelfQuery = () => {
  const { isAuthorized } = useAuth();
  return useQuery({
    queryKey: ["preference-self"],
    queryFn: apis.getPreferencesSelf,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    enabled: isAuthorized,
  });
};

export const useNotificationQuery = () => {
  const { isAuthorized } = useAuth();
  return useQuery({
    queryKey: ["notification"],
    queryFn: apis.getNotification,
    staleTime: 0,
    enabled: isAuthorized,
  });
};

export const useBannersQuery = (position: BannerPosition) =>
  useQuery({
    queryKey: ["banners", position],
    queryFn: () => apis.getBanners(position),
  });

export { useExistsUniversityQuery } from "./use-exists-university";
export { useCheckBusanQuery } from "./use-check-busan";
