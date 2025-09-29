import { createQueryAdapter } from "@SmartNewbieProject/sometime-error";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1000 * 60,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
  },
  queryCache: new QueryCache({
    onError: createQueryAdapter(),
  }),
  mutationCache: new MutationCache({
    onError: createQueryAdapter(),
  }),
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
