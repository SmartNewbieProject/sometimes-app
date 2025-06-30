import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { InfiniteScrollProvider } from '../infinite-scroll/infinite-scroll-provider';
import { useFlatListRef } from '../infinite-scroll/strategies/native-infinite-scroll-strategy';
import { useLastItemRef } from '../infinite-scroll/strategies/web-infinite-scroll-strategy';
import type { InfiniteScrollOptions } from '../infinite-scroll/types';

export function useInfiniteScroll<T>(
	onLoadMore: () => void,
	options: Omit<InfiniteScrollOptions, 'lastItemRef' | 'scrollContainerRef'> = {},
) {
	const providerRef = useRef<InfiniteScrollProvider | null>(null);

	const lastItemRef = useLastItemRef();
	const flatListRef = useFlatListRef<T>();

	if (!providerRef.current) {
		providerRef.current = new InfiniteScrollProvider();
	}

	const setupScroll = () => {
		if (!providerRef.current) return;
		providerRef.current.setupScroll(onLoadMore, {
			...options,
			lastItemRef: Platform.OS === 'web' ? lastItemRef : undefined,
			scrollContainerRef: Platform.OS !== 'web' ? flatListRef : undefined,
		});
	};

	const cleanupScroll = () => {
		if (providerRef.current) {
			providerRef.current.cleanupScroll();
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			setupScroll();
		}, 300);

		return () => {
			clearTimeout(timer);
			cleanupScroll();
		};
	}, [setupScroll, cleanupScroll]);

	const lastItemRefValueRef = useRef<any>(null);

	useEffect(() => {
		if (Platform.OS === 'web') {
			if (lastItemRef.current !== lastItemRefValueRef.current) {
				lastItemRefValueRef.current = lastItemRef.current;

				if (lastItemRef.current && providerRef.current) {
					const timer = setTimeout(() => {
						const strategy = providerRef.current?.getStrategy();
						if (strategy && 'updateObserver' in strategy) {
							(strategy as any).updateObserver();

							setTimeout(() => {
								if (strategy && (strategy as any).isCallbackCalled) {
									(strategy as any).isCallbackCalled = false;
								}
							}, 1000);
						}
					}, 500);
					return () => clearTimeout(timer);
				}
			}
		}
	});

	const scrollProps = providerRef.current?.getScrollProps() || {};

	return {
		scrollProps,

		lastItemRef: Platform.OS === 'web' ? lastItemRef : undefined,
		flatListRef: Platform.OS !== 'web' ? flatListRef : undefined,

		getLastItemProps: () => {
			if (Platform.OS === 'web') {
				return {
					ref: lastItemRef as any,
					style: { minHeight: 10 },
				};
			}
			return {};
		},
	};
}
