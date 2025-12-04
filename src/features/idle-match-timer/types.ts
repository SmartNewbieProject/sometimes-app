import type { UserProfile } from '@/src/types/user';
import type { Dayjs } from 'dayjs';

export type MatchViewType = 'open' | 'waiting' | 'not-found' | 'rematching';

export type MatchDetails = {
	id: string | null;
	type: MatchViewType;
	endOfView: Dayjs | null;
	partner: UserProfile | null;
	untilNext: string | null;
	connectionId: string | null;
};

export type ServerMatchDetails = Omit<MatchDetails, 'endOfView'> & {
	endOfView: string | null;
};

export type OpenMatch = MatchDetails & {
	type: 'open' | 'rematching';
	partner: UserProfile;
	endOfView: Dayjs;
	id: string;
	connectionId: string;
};

export type WaitingMatch = MatchDetails & {
	type: 'waiting';
	untilNext: string;
};

export type NotFoundMatch = MatchDetails & {
	type: 'not-found';
	untilNext: string;
};

export const isOpenMatch = (match: MatchDetails): match is OpenMatch =>
	(match.type === 'open' || match.type === 'rematching') &&
	match.partner !== null &&
	match.endOfView !== null;

export const isWaitingMatch = (match: MatchDetails): match is WaitingMatch =>
	match.type === 'waiting' && match.untilNext !== null;

export const isNotFoundMatch = (match: MatchDetails): match is NotFoundMatch =>
	match.type === 'not-found' && match.untilNext !== null;
