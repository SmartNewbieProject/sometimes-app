import type { RegionCode } from "@/src/shared/constants/region";
import {
  UniversityImage,
  type UniversityName,
  getSmartUnivLogoUrl,
  getUnivLogo,
} from "@/src/shared/libs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getUniversitiesByRegion } from "../apis";
import { useSignupProgress } from "../hooks";
import {
  type UIRegion,
  type UniversityType,
  getRegionsByRegionCode,
  getUniversityLogoFolderName,
  getUniversityType,
} from "../lib";

export default function useUniversities() {
  const { regions } = useSignupProgress();

  const { data, isLoading } = useQuery({
    queryFn: () => getUniversitiesByRegion(regions),
    queryKey: ["universities", ...regions],
  });
  const mappedData = data?.map((item) => ({
    ...item,
    logoUrl: getSmartUnivLogoUrl(item.code),
    universityType: getUniversityType(item.name),
    area: getRegionsByRegionCode(item.region as RegionCode),
  }));

  return { data: mappedData, isLoading };
}

export type UniversitiesByRegion = {
  id: string;
  name: string;
  code: string;
  region: string;
}[];

export type UniversityCard = {
  logoUrl: string;
  universityType: UniversityType;
  area: UIRegion | undefined;
  id: string;
  name: string;
  code: string;
  region: string;
};
