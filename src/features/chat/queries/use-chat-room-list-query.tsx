import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatRooms } from "../apis";
import { useAuth } from "@/src/features/auth/hooks/use-auth";

export const useChatRoomListQuery = () => {
  const { isAuthorized } = useAuth();

  return useInfiniteQuery({
    queryKey: ["chat-room"],
    queryFn: getChatRooms,
    enabled: isAuthorized,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.nextCursor;
      }
      return undefined;
    },
  });
};
