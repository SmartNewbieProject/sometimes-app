import { useMutation } from '@tanstack/react-query';
import { feedbackApi, type FeedbackCategory } from '../api';

export function useSubmitFeedback() {
	return useMutation({
		mutationFn: (params: { message: string; category?: FeedbackCategory }) =>
			feedbackApi.submit(params),
	});
}
