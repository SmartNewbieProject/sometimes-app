import type { MatchDetails, ServerMatchDetails } from './types';

export type MatchCategory = 'scheduled' | 'rematch' | 'global';

export type MatchDetailsV31 = MatchDetails & {
	category?: MatchCategory;
	pendingCount?: number;
	isGlobalMatch?: boolean;
	targetCountry?: 'kr' | 'jp';
};

export type ServerMatchDetailsV31 = Omit<MatchDetailsV31, 'endOfView'> & {
	endOfView: string | null;
};

export type MatchCompositeResponse = {
	primary: ServerMatchDetailsV31;
	secondary?: ServerMatchDetailsV31;
};

export type MatchComposite = {
	primary: MatchDetailsV31;
	secondary?: MatchDetailsV31;
};

export const CATEGORY_COLORS = {
	scheduled: { primary: '#7A4AE2', gradient: ['#9B6DFF', '#7A4AE2'] as const },
	rematch: { primary: '#FF8C42', gradient: ['#FFB347', '#FF8C42'] as const },
	global: { primary: '#4A90D9', gradient: ['#6BB5FF', '#4A90D9'] as const },
} as const;
