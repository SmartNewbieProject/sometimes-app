import { useQuery } from "@tanstack/react-query";
import apis from "../apis";

export const useTotalMatchCountQuery = () =>
  useQuery({
    queryKey: ['total-match-count'],
    queryFn: apis.getTotalMatchCount,
  });
