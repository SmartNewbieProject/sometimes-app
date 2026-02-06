import { useMutation } from '@tanstack/react-query';
import apis from '../apis';
import type { LanguageCode, SubmitAnswerRequest } from '../types';

/**
 * 답변 제출 mutation
 *
 * POST /api/v1/ideal-type-test/answer
 *
 * @example
 * const { mutate, data } = useSubmitAnswer();
 * mutate({
 *   request: {
 *     sessionId: 'session-id',
 *     answers: [{ questionId: 'Q1', selectedOptionId: 'O1' }]
 *   },
 *   lang: 'ko'
 * });
 */
export const useSubmitAnswer = () => {
	return useMutation({
		mutationFn: ({
			request,
			lang = 'ko',
		}: {
			request: SubmitAnswerRequest;
			lang?: LanguageCode;
		}) => apis.submitAnswer(request, lang),
	});
};
