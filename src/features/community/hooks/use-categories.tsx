import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { create } from 'zustand';
import apis from '../apis';

export const HOME_CODE = '__home__';
export const SOMETIME_STORY_CODE = '__sometime_story__';

interface State {
	category?: string;
	changeCategory: (categories: string) => void;
}

const useStore = create<State>((set) => ({
	changeCategory: (category) => set({ category }),
}));

export const useCategory = () => {
	const category = useStore((s) => s.category);
	const changeCategory = useStore((s) => s.changeCategory);
	const { data: categories = [], ...queryProps } = useQuery({
		queryKey: ['category-list'],
		queryFn: apis.articles.getCategoryList,
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		if (category) return;
		//changeCategory(categories[0]?.code);
		changeCategory(HOME_CODE);
	}, [queryProps.isFetched]);

	return {
		categories,
		currentCategory: category,
		changeCategory,
		...queryProps,
	};
};
