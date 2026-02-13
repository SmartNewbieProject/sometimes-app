import { useMutation } from '@tanstack/react-query';
import apis from '../apis';
import type { LanguageCode } from '../types';

/**
 * 로그인 유저 테스트 재시도 mutation
 *
 * POST /v1/users/me/ideal-type-result/retake
 */
export const useRetakeTest = () => {
	return useMutation({
		mutationFn: ({ lang = 'ko' }: { lang?: LanguageCode }) => apis.retakeTest(lang),
	});
};
