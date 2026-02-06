import { useQuery } from '@tanstack/react-query';
import apis from '../apis';
import { IDEAL_TYPE_TEST_QUERY_KEYS } from '../constants';
import type { LanguageCode } from '../types';

/**
 * 세션 상태 조회 query
 *
 * GET /api/v1/ideal-type-test/session/:sessionId
 *
 * @param sessionId - 세션 ID
 * @param lang - 언어 코드 (기본값: 'ko')
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 *
 * @example
 * const { data, isLoading } = useSession({ sessionId: 'session-id' });
 */
export const useSession = ({
	sessionId,
	lang = 'ko',
	enabled = true,
}: {
	sessionId: string;
	lang?: LanguageCode;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: IDEAL_TYPE_TEST_QUERY_KEYS.sessionStatus(sessionId),
		queryFn: () => apis.getSessionStatus(sessionId, lang),
		enabled: enabled && !!sessionId,
	});
};
