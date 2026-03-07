import { axiosClient } from '@/src/shared/libs';

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'other';

export interface SubmitFeedbackBody {
	message: string;
	category?: FeedbackCategory;
}

export const feedbackApi = {
	submit: (body: SubmitFeedbackBody) =>
		axiosClient.post<void>('/feedback', body),
};
