import { axiosClient } from '@/src/shared/libs';

// 1. 사용자 상호작용 엔드포인트

export interface LikeUserRequest {
	letterContent?: string; // 최대 100자, 선택
	isCustomLetter?: boolean; // 커스텀 편지 여부
}

export interface PurchaseLetterResponse {
	letterQuestionId: string; // 생성된 질문 ID
	questions: string[]; // 3개의 생성된 질문
	canLetter: true; // 편지 권한 활성화
}

// 2. 편지 프롬프트 엔드포인트

export interface LetterPromptResponse {
	letterQuestionId: string;
	questions: string[];
	canLetter: boolean;
}

export interface LetterPromptTrackingRequest {
	generationId: string; // 생성 ID (필수)
	selectedPromptIndex?: number; // 선택한 프롬프트 인덱스
	userModifiedText?: string; // 사용자 수정 텍스트
}

export const likeLetterApi = {
	postLikeWithLetter: (connectionId: string, body: LikeUserRequest) =>
		axiosClient.post(`/v1/matching/interactions/like/${connectionId}`, body),

	purchaseLetterPermission: (connectionId: string): Promise<PurchaseLetterResponse> =>
		axiosClient.post(`/v1/matching/interactions/letter/${connectionId}`),

	getLetterPrompts: (connectionId: string): Promise<LetterPromptResponse> =>
		axiosClient.post(`/v1/matching/interactions/letter/${connectionId}`),

	trackLetterPrompt: (body: LetterPromptTrackingRequest) =>
		axiosClient.post('/v1/matching/interactions/letter-prompts/track', body),
};
