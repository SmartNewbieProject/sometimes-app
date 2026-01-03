import { axiosClient } from '@/src/shared/libs';

export interface LikeUserRequest {
	letterContent?: string;
	isCustomLetter?: boolean;
}

export interface LetterPermissionResponse {
	letterQuestionId: string;
	questions: string[];
	canLetter: boolean;
}

export interface LetterPromptTrackingRequest {
	generationId: string;
	selectedPromptIndex?: number;
	userModifiedText?: string;
}

export const likeLetterApi = {
	getLetterPermission: (connectionId: string): Promise<LetterPermissionResponse> =>
		axiosClient.post(`/v1/matching/interactions/letter/${connectionId}`),

	sendLike: (connectionId: string, body: LikeUserRequest) =>
		axiosClient.post(`/v1/matching/interactions/like/${connectionId}`, body),

	trackLetterPrompt: (body: LetterPromptTrackingRequest) =>
		axiosClient.post('/v1/matching/interactions/letter-prompts/track', body),
};
