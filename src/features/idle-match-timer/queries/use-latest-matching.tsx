import { useQuery } from "@tanstack/react-query";
import { getLatestMatching } from "../apis";

export const useLatestMatching = () => {
  const { data: match, ...queryProps } = useQuery({
    queryKey: ['latest-matching'],
    queryFn: getLatestMatching,
  });

  return { match, ...queryProps };
};
