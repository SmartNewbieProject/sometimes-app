import { useSuspenseQuery } from "@tanstack/react-query";
import { getDepartments } from "../apis";

export const useDepartmentQuery = (univ?: string) =>
  useSuspenseQuery({
    queryKey: ['departments', univ],
    queryFn: () => {
      if (!univ) return [] as string[];
      return getDepartments(univ)
    },
  });
