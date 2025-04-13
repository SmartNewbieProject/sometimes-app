import { useSuspenseQuery } from "@tanstack/react-query";
import apis from "../apis";

export function useUnivQuery() {
  return useSuspenseQuery({
    queryKey: ['univs'],
    queryFn: apis.getUnivs,
  });
}
