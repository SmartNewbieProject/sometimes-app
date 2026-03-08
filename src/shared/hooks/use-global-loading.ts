import { useCallback } from 'react';
import { useGlobalLoadingStore } from '../stores/global-loading-store';

export function useGlobalLoading() {
	const {
		setLoading,
		incrementLoading,
		decrementLoading,
		isLoading,
		disableGlobalLoading,
		enableGlobalLoading,
	} = useGlobalLoadingStore();

	const withLoading = useCallback(
		async <T>(fn: () => Promise<T>): Promise<T> => {
			const startTime = Date.now();
			incrementLoading();
			try {
				return await fn();
			} finally {
				const elapsed = Date.now() - startTime;
				const remaining = Math.max(0, 400 - elapsed);
				if (remaining > 0) {
					setTimeout(() => decrementLoading(), remaining);
				} else {
					decrementLoading();
				}
			}
		},
		[incrementLoading, decrementLoading],
	);

	return {
		isLoading,
		showLoading: () => setLoading(true),
		hideLoading: () => setLoading(false),
		incrementLoading,
		decrementLoading,
		disableGlobalLoading,
		enableGlobalLoading,
		withLoading,
	};
}
