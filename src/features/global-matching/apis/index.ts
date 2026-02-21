import { axiosClient, dayUtils } from '@/src/shared/libs';
import { devLogWithTag } from '@/src/shared/utils';
import type {
	CompleteOnboardingRequest,
	CompleteOnboardingResponse,
	GlobalAcceptResponse,
	GlobalLikeResponse,
	GlobalMatchDetails,
	GlobalMatchingStatus,
	GlobalPreferenceCategory,
	ServerGlobalMatchDetails,
} from '../types';

export const getGlobalMatching = (): Promise<GlobalMatchDetails> =>
	axiosClient.get('/global-matching/matching').then((result: unknown) => {
		const data = result as ServerGlobalMatchDetails;

		devLogWithTag('API', 'Global Matching:', {
			id: data.id,
			type: data.type,
			connectionId: data.connectionId,
		});

		const transformedData: GlobalMatchDetails = {
			...data,
			endOfView: data.endOfView ? dayUtils.create(data.endOfView) : null,
		};

		return transformedData;
	});

export const globalLike = (connectionId: string, letter?: string): Promise<GlobalLikeResponse> =>
	axiosClient.post(`/global-matching/like/${connectionId}`, letter ? { letter } : {});

export const globalSkip = (connectionId: string): Promise<void> =>
	axiosClient.delete(`/global-matching/bye/${connectionId}`);

export const globalRematch = (): Promise<void> =>
	axiosClient.post('/v3/matching/rematch/jp', {}, { timeout: 30000 });

export const globalAccept = (connectionId: string): Promise<GlobalAcceptResponse> =>
	axiosClient.post(`/global-matching/accept/${connectionId}`);

export const globalReject = (connectionId: string): Promise<void> =>
	axiosClient.delete(`/global-matching/reject/${connectionId}`);

export const completeOnboarding = (
	data?: CompleteOnboardingRequest,
): Promise<CompleteOnboardingResponse> =>
	axiosClient.post('/global-matching/onboarding', data ?? {});

export const getGlobalMatchingStatus = (): Promise<GlobalMatchingStatus> =>
	axiosClient.get('/global-matching/status');

export const getGlobalPreferenceOptions = (): Promise<GlobalPreferenceCategory[]> =>
	axiosClient.get('/global-matching/preferences/options');
