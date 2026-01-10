import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGlobalLoadingSync } from '../hooks/use-global-loading';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			retry: false,
			staleTime: 1000 * 60,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			 experimental_prefetchInRender: true,
		},
	},
});

function GlobalLoadingSync() {
	useGlobalLoadingSync();
	return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<GlobalLoadingSync />
			{children}
		</QueryClientProvider>
	);
}
 