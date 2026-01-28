import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getArticleByIdOrSlug, incrementViewCount } from '../apis';
import { ARTICLE_QUERY_KEYS } from './keys';

interface UseArticleDetailProps {
	idOrSlug: string;
	enabled?: boolean;
}

export const useArticleDetail = ({ idOrSlug, enabled = true }: UseArticleDetailProps) => {
	const queryClient = useQueryClient();

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ARTICLE_QUERY_KEYS.detail(idOrSlug),
		queryFn: () => getArticleByIdOrSlug(idOrSlug),
		enabled: enabled && !!idOrSlug,
		staleTime: 60_000,
		gcTime: 10 * 60 * 1000,
	});

	// 조회수 증가 (컴포넌트 마운트 시 1회)
	useEffect(() => {
		if (data?.id) {
			incrementViewCount(data.id).then((response) => {
				// 캐시 업데이트
				queryClient.setQueryData(
					ARTICLE_QUERY_KEYS.detail(idOrSlug),
					(oldData: typeof data | undefined) => {
						if (!oldData) return oldData;
						return { ...oldData, viewCount: response.count };
					},
				);
			});
		}
	}, [data?.id, idOrSlug, queryClient]);

	return {
		article: data,
		isLoading,
		isError,
		error,
		refetch,
	};
};
