import { useQuery } from '@tanstack/react-query';
import apis from '../apis';
import { IDEAL_TYPE_TEST_QUERY_KEYS } from '../constants';
import type { LanguageCode } from '../types';

/**
 * 내 결과 조회 query (인증 필요)
 *
 * GET /api/v1/users/me/ideal-type-result
 *
 * @param lang - 언어 코드 (기본값: 'ko')
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 *
 * @example
 * const { data, isLoading } = useMyResult({ enabled: isAuthorized });
 */
export const useMyResult = ({
	lang = 'ko',
	enabled = true,
}: {
	lang?: LanguageCode;
	enabled?: boolean;
} = {}) => {
	return useQuery({
		queryKey: IDEAL_TYPE_TEST_QUERY_KEYS.myResult,
		queryFn: () => apis.getMyResult(lang),
		enabled,
	});
};
