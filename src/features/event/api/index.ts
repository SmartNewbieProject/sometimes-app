import { axiosClient } from '@shared/libs';
import type { EventDetails, EventType, RouletteEligibility, RouletteResponse } from '../types';

export const getEventByType = (type: EventType) =>
	axiosClient.get(`v1/event/${type}`) as Promise<EventDetails>;

export const participateEvent = (type: EventType) => axiosClient.patch(`v1/event/${type}`);

export const postRouletteSpin = () =>
	axiosClient.post('/events/roulette/spin', {}) as Promise<RouletteResponse>;

export const getRouletteEligibility = () =>
	axiosClient.get('/events/roulette/eligibility') as Promise<RouletteEligibility>;

export const getReferralCode = () =>
	axiosClient.get('/user/referral-code') as Promise<{code: string}>