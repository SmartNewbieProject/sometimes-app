import axiosClient from '@/src/shared/libs/axios';
import type {
	CloseSessionRequest,
	CloseSessionResponse,
	CreateSessionRequest,
	CreateSessionResponse,
	GetMySessionsResponse,
	GetSessionMessagesResponse,
} from '../types';

const BASE_PATH = '/support-chat';

export const createSession = (data?: CreateSessionRequest): Promise<CreateSessionResponse> => {
	return axiosClient.post(`${BASE_PATH}/sessions`, data ?? { language: 'ko' });
};

export const getMySessions = (): Promise<GetMySessionsResponse> => {
	return axiosClient.get(`${BASE_PATH}/sessions/me`);
};

export const getSessionMessages = (sessionId: string): Promise<GetSessionMessagesResponse> => {
	return axiosClient.get(`${BASE_PATH}/sessions/${sessionId}/messages`);
};

export const closeSession = (
	sessionId: string,
	data?: CloseSessionRequest,
): Promise<CloseSessionResponse> => {
	return axiosClient.post(`${BASE_PATH}/sessions/${sessionId}/close`, data ?? {});
};
