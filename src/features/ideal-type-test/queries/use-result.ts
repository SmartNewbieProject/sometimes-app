import { useQuery } from '@tanstack/react-query';
import apis from '../apis';
import { IDEAL_TYPE_TEST_QUERY_KEYS } from '../constants';
import type { LanguageCode } from '../types';

/**
 * 테스트 결과 조회 query
 *
 * GET /api/v1/ideal-type-test/result/:sessionId
 *
 * @param sessionId - 세션 ID
 * @param lang - 언어 코드 (기본값: 'ko')
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 *
 * @example
 * const { data, isLoading } = useResult({ sessionId: 'session-id' });
 */
export const useResult = ({
	sessionId,
	lang = 'ko',
	enabled = true,
}: {
	sessionId: string;
	lang?: LanguageCode;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: IDEAL_TYPE_TEST_QUERY_KEYS.result(sessionId),
		queryFn: () => apis.getTestResult(sessionId, lang),
		enabled: enabled && !!sessionId,
	});
};
