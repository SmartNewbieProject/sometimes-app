import type { RegionCode } from "@/src/shared/constants/region";
import {
  UniversityImage,
  getSmartUnivLogoUrl,
  getUnivLogo,
} from "@/src/shared/libs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGlobalSearchParams } from "expo-router";
import { getUniversitiesByRegion } from "../apis";
import { getAllRegionList, getRegionsByRegionCode } from "../lib";

export default function useUniversities() {
  const { data, isLoading } = useQuery({
    queryFn: () => getUniversitiesByRegion(getAllRegionList()),
    queryKey: ["universities", "all"],
  });
  console.log("universities", data);
  const mappedData = data?.map((item) => ({
    ...item,
    logoUrl: getSmartUnivLogoUrl(item.code),
    universityType: item.foundation,
    area: getRegionsByRegionCode(item.region as RegionCode),
  }));

  return { data: mappedData, isLoading };
}

export type UniversitiesByRegion = {
  id: string;
  name: string;
  code: string;
  region: RegionCode;
  en: string;
  foundation: string;
}[];

export type UniversityCard = {
  logoUrl: string;
  universityType: string;
  area: string | undefined;
  id: string;
  name: string;
  code: string;
  region: RegionCode;
  en: string;
  foundation: string;
};
