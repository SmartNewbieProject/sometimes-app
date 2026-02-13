import { useQuery } from '@tanstack/react-query';
import apis from '../apis';
import { IDEAL_TYPE_TEST_QUERY_KEYS } from '../constants';
import type { ResultTypeId } from '../types';

/**
 * 결과 타입 통계 조회 query
 *
 * GET /v1/ideal-type-test/stats/:resultTypeId
 */
export const useStats = ({
	resultTypeId,
	enabled = true,
}: {
	resultTypeId: ResultTypeId;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: IDEAL_TYPE_TEST_QUERY_KEYS.stats(resultTypeId),
		queryFn: () => apis.getStats(resultTypeId),
		enabled: enabled && !!resultTypeId,
	});
};
