import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useGlobalLoadingStore } from '../stores/global-loading-store';

const LOADING_DELAY_MS = 300;

export function useGlobalLoadingSync() {
	const isFetching = useIsFetching();
	const isMutating = useIsMutating();
	const { setLoading } = useGlobalLoadingStore();
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const isActive = isFetching > 0 || isMutating > 0;

		if (isActive) {
			if (!timeoutRef.current) {
				timeoutRef.current = setTimeout(() => {
					setLoading(true);
				}, LOADING_DELAY_MS);
			}
		} else {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			setLoading(false);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [isFetching, isMutating, setLoading]);
}

export function useGlobalLoading() {
	const {
		setLoading,
		incrementLoading,
		decrementLoading,
		isLoading,
		disableGlobalLoading,
		enableGlobalLoading,
	} = useGlobalLoadingStore();

	return {
		isLoading,
		showLoading: () => setLoading(true),
		hideLoading: () => setLoading(false),
		incrementLoading,
		decrementLoading,
		disableGlobalLoading,
		enableGlobalLoading,
	};
}
