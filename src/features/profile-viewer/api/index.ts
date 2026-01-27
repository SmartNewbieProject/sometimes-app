import { axiosClient } from '@/src/shared/libs';
import type {
	GetViewersParams,
	GetViewersResponse,
	HomeSummaryResponse,
	LikeViewerRequest,
	LikeViewerResponse,
	RevealCostResponse,
	RevealViewerResponse,
	ViewerCountsResponse,
} from '../type';

const BASE = '/v1/profile-viewers';

// GET /v1/profile-viewers - List viewers
export const getViewersList = (params?: GetViewersParams): Promise<GetViewersResponse> => {
	return axiosClient.get(BASE, { params });
};

// GET /v1/profile-viewers/count - Get counts
export const getViewerCounts = (): Promise<ViewerCountsResponse> => {
	return axiosClient.get(`${BASE}/count`);
};

// GET /v1/profile-viewers/cost - Get reveal cost
export const getRevealCost = (): Promise<RevealCostResponse> => {
	return axiosClient.get(`${BASE}/cost`);
};

// GET /v1/profile-viewers/home-summary - Home screen data (5min Redis cache)
export const getHomeSummary = (): Promise<HomeSummaryResponse> => {
	return axiosClient.get(`${BASE}/home-summary`);
};

// POST /v1/profile-viewers/{summaryId}/reveal - Reveal profile
export const revealViewer = (summaryId: string): Promise<RevealViewerResponse> => {
	return axiosClient.post(`${BASE}/${summaryId}/reveal`);
};

// POST /v1/profile-viewers/{summaryId}/like - Send like
export const likeViewer = (
	summaryId: string,
	request?: LikeViewerRequest,
): Promise<LikeViewerResponse> => {
	return axiosClient.post(`${BASE}/${summaryId}/like`, request ?? {});
};
