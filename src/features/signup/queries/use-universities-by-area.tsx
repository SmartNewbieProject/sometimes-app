import type { RegionCode } from "@/src/shared/constants/region";
import {
  UniversityImage,
  getSmartUnivLogoUrl,
  getUnivLogo,
} from "@/src/shared/libs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGlobalSearchParams } from "expo-router";
import { getUniversitiesByRegion } from "../apis";
import { useSignupProgress } from "../hooks";
import {
  getAllRegionList,
  getRegionListByCode,
  getRegionsByRegionCode,
} from "../lib";

export default function useUniversitiesByArea(regions: string[]) {
  const { data, isLoading } = useQuery({
    queryFn: () => getUniversitiesByRegion(getRegionListByCode(regions[0])),
    queryKey: ["universities", [...regions]],
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
