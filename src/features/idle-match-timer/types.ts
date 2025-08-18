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
