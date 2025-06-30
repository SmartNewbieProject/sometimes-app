import { useQuery } from '@tanstack/react-query';
import { getComments } from '../apis/comments';

const QUERY_KEYS = {
	comments: {
		lists: (articleId: string) => ['comments', articleId],
	},
};

export function useArticleComments(articleId: string) {
	const {
		data: comments = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: QUERY_KEYS.comments.lists(articleId),
		queryFn: async () => {
			const response = await getComments({ articleId });
			return response;
		},
	});

	return {
		comments,
		isLoading,
		refetch,
	};
}
