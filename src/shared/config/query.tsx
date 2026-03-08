import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { Platform, AppState, type AppStateStatus } from 'react-native';

if (Platform.OS !== 'web') {
	focusManager.setEventListener((handleFocus) => {
		const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
			handleFocus(state === 'active');
		});
		return () => subscription.remove();
	});

	onlineManager.setEventListener((setOnline) => {
		return NetInfo.addEventListener((state) => {
			setOnline(!!state.isConnected);
		});
	});
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			retry: false,
			staleTime: 1000 * 60,
			refetchInterval: false,
			refetchIntervalInBackground: false,
		},
	},
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}
 