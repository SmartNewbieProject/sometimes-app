import { axiosClient } from '@/src/shared/libs';

interface TotalMatchCountResponse {
	count: number;
}

export type Notification = {
	announcement: string;
	title: string;
	content: string;
	redirectUrl?: string;
	okMessage: string;
};

export const getTotalMatchCount = (): Promise<TotalMatchCountResponse> =>
	axiosClient.get('/matching/total-count');

export const getNotification = (): Promise<Notification[]> =>
	axiosClient.get('/profile/notifications');

export const checkPreferenceFill = async (): Promise<boolean> =>
	axiosClient.get('/preferences/check/fill');

export const getTotalUserCount = (): Promise<number> => axiosClient.get('/stats/total-user-count');

type HomeApiService = {
	getTotalMatchCount: () => Promise<TotalMatchCountResponse>;
	checkPreferenceFill: () => Promise<boolean>;
	getTotalUserCount: () => Promise<number>;
	getNotification: () => Promise<Notification[]>;
};

const apis: HomeApiService = {
	getTotalMatchCount,
	checkPreferenceFill,
	getTotalUserCount,
	getNotification,
};

export default apis;
