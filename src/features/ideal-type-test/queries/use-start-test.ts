import { useMutation } from '@tanstack/react-query';
import apis from '../apis';
import type { LanguageCode, StartTestRequest } from '../types';

/**
 * 이상형 테스트 시작 mutation
 *
 * POST /api/v1/ideal-type-test/start
 *
 * @example
 * const { mutate, data } = useStartTest();
 * mutate({ request: { source: 'mobile' }, lang: 'ko' });
 */
export const useStartTest = () => {
	return useMutation({
		mutationFn: ({
			request,
			lang = 'ko',
		}: {
			request?: StartTestRequest;
			lang?: LanguageCode;
		}) => apis.startTest(request, lang),
	});
};
