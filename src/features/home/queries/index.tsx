import { useQuery } from "@tanstack/react-query";
import apis from "../apis";
import type { BannerPosition } from "../types";

export const useTotalMatchCountQuery = () =>
  useQuery({
    queryKey: ["total-match-count"],
    queryFn: apis.getTotalMatchCount,
  });

export const useTotalUserCountQuery = () =>
  useQuery({
    queryKey: ["total-user-count"],
    queryFn: apis.getTotalUserCount,
  });

export const useCheckPreferenceFillQuery = () =>
  useQuery({
    queryKey: ["check-preference-fill"],
    queryFn: apis.checkPreferenceFill,
    staleTime: 0,
    gcTime: 0,
  });

export const usePreferenceSelfQuery = () =>
  useQuery({
    queryKey: ["preference-self"],
    queryFn: apis.getPreferencesSelf,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

export const useNotificationQuery = () =>
  useQuery({
    queryKey: ["notification"],
    queryFn: apis.getNotification,
    staleTime: 0,
  });

export const useBannersQuery = (position: BannerPosition) =>
  useQuery({
    queryKey: ["banners", position],
    queryFn: () => apis.getBanners(position),
  });

export { useExistsUniversityQuery } from "./use-exists-university";
export { useCheckBusanQuery } from "./use-check-busan";
