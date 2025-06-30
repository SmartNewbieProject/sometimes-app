import { useCallback, useRef, useState } from 'react';
import type { FlatList } from 'react-native';

export function useCarousel<T extends { id?: string }>(items: T[]) {
	const flatListRef = useRef<FlatList<T>>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [activeId, setActiveId] = useState(items[0]?.id ?? String(0));

	const goTo = useCallback(
		(index: number) => {
			if (flatListRef.current) {
				flatListRef.current.scrollToIndex({ index, animated: true });
				setActiveIndex(index);
				setActiveId(items[index]?.id ?? String(index));
			}
		},
		[items],
	);

	const next = useCallback(() => {
		if (activeIndex < items.length - 1) {
			goTo(activeIndex + 1);
		}
	}, [activeIndex, items.length, goTo]);

	const prev = useCallback(() => {
		if (activeIndex > 0) {
			goTo(activeIndex - 1);
		}
	}, [activeIndex, goTo]);

	return {
		flatListRef,
		activeIndex,
		activeId,
		setActiveIndex: (idx: number) => {
			setActiveIndex(idx);
			setActiveId(items[idx]?.id ?? String(idx));
		},
		goTo,
		next,
		prev,
	};
}
