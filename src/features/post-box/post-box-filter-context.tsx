import { createContext, useContext } from 'react';

export type LikedMeFilter = 'LATEST' | 'LETTER';

interface PostBoxFilterContextValue {
	filter: LikedMeFilter;
	setFilter: (filter: LikedMeFilter) => void;
}

export const PostBoxFilterContext = createContext<PostBoxFilterContextValue>({
	filter: 'LATEST',
	setFilter: () => {},
});

export const usePostBoxFilter = () => useContext(PostBoxFilterContext);
