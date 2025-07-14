import { useQuery } from "@tanstack/react-query";
import apis from "../apis";

export const useRematchingTickets = () =>
  useQuery({
    queryKey: ["rematching-tickets"],
    queryFn: () => apis.getAllRematchingTicket(),
    placeholderData: {
      total: 0,
    },
  });
