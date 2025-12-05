import { axiosClient } from '@shared/libs';
import type {
	RecordClickRequest,
	RecordClickResponse,
	RecordConversionRequest,
	RecordConversionResponse,
	InviteStatsQuery,
	InviteStatsResponse,
} from '../types';

export const recordInviteClick = (inviteCode: string, data: RecordClickRequest) =>
	axiosClient.post(`/v1/invites/${inviteCode}/click`, data) as Promise<RecordClickResponse>;

export const recordInviteConversion = (inviteCode: string, data: RecordConversionRequest) =>
	axiosClient.post(`/v1/invites/${inviteCode}/conversion`, data) as Promise<RecordConversionResponse>;

export const getMyInviteStats = (query?: InviteStatsQuery) => {
	const params = new URLSearchParams();

	if (query?.fromDate) params.append('fromDate', query.fromDate);
	if (query?.toDate) params.append('toDate', query.toDate);
	if (query?.includeDaily !== undefined) params.append('includeDaily', String(query.includeDaily));
	if (query?.includeList !== undefined) params.append('includeList', String(query.includeList));

	const queryString = params.toString();
	const url = queryString ? `/v1/invites/my-stats?${queryString}` : '/v1/invites/my-stats';

	return axiosClient.get(url) as Promise<InviteStatsResponse>;
};
