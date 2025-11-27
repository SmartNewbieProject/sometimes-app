import { useQuery } from "@tanstack/react-query";
import apis from "../apis";

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
  });

export const useNotificationQuery = () =>
  useQuery({
    queryKey: ["notification"],
    queryFn: apis.getNotification,
    staleTime: 0,
  });

export const useHomeBannersQuery = () =>
  useQuery({
    queryKey: ["home-banners"],
    queryFn: apis.getHomeBanners,
    initialData: [
      {
        id: "introduction-sometimes",
        imageUrl: require("@/assets/images/moment/introduction-sometimes.png"),
        title: "Sometimes 소개",
        link: undefined,
        externalLink: undefined,
      },
    ],
  });

export { useExistsUniversityQuery } from "./use-exists-university";
export { useCheckBusanQuery } from "./use-check-busan";
