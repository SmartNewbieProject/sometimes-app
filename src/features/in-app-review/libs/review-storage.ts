import { storage } from '@/src/shared/libs/store';
import { STORAGE_KEY } from '../constants/review-config';
import type { ReviewTrackingData, ReviewTriggerType } from '../types';

const DEFAULT_TRACKING_DATA: ReviewTrackingData = {
	requestCount: 0,
	lastRequestDate: null,
	requestTriggers: [],
};

export const getReviewTrackingData = async (): Promise<ReviewTrackingData> => {
	try {
		const data = await storage.getItem(STORAGE_KEY.REVIEW_TRACKING);
		if (!data) return DEFAULT_TRACKING_DATA;
		return JSON.parse(data);
	} catch (error) {
		console.error('[ReviewStorage] Error getting tracking data:', error);
		return DEFAULT_TRACKING_DATA;
	}
};

export const saveReviewRequest = async (triggerType: ReviewTriggerType): Promise<void> => {
	try {
		const currentData = await getReviewTrackingData();
		const updatedData: ReviewTrackingData = {
			requestCount: currentData.requestCount + 1,
			lastRequestDate: new Date().toISOString(),
			requestTriggers: [...currentData.requestTriggers, triggerType],
		};
		await storage.setItem(STORAGE_KEY.REVIEW_TRACKING, JSON.stringify(updatedData));
	} catch (error) {
		console.error('[ReviewStorage] Error saving review request:', error);
	}
};

export const getRequestCount = async (): Promise<number> => {
	const data = await getReviewTrackingData();
	return data.requestCount;
};

export const getLastRequestDate = async (): Promise<string | null> => {
	const data = await getReviewTrackingData();
	return data.lastRequestDate;
};

export const hasRequestedWithTrigger = async (triggerType: ReviewTriggerType): Promise<boolean> => {
	const data = await getReviewTrackingData();
	return data.requestTriggers.includes(triggerType);
};
