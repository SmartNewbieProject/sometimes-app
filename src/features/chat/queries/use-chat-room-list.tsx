import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatRooms } from "../apis";

export const useChatRoomList = () => {
  return useInfiniteQuery({
    queryKey: ["chat-room"],
    queryFn: getChatRooms,
    staleTime: 0,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.nextCursor;
      }
      return undefined;
    },
  });
};
