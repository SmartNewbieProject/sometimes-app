import { create } from 'zustand';
import type { MatchData, BadgeData } from '../types';

interface MatchingState {
	currentMatch: MatchData | null;
	currentBadge: BadgeData | null;
	userRegion: string;
	matchAttempts: number;

	setCurrentMatch: (match: MatchData | null) => void;
	setCurrentBadge: (badge: BadgeData | null) => void;
	setUserRegion: (region: string) => void;
	incrementMatchAttempts: () => void;
	resetMatchAttempts: () => void;
	reset: () => void;
}

export const useMatchingStore = create<MatchingState>((set) => ({
	currentMatch: null,
	currentBadge: null,
	userRegion: '',
	matchAttempts: 0,

	setCurrentMatch: (match) => set({ currentMatch: match }),
	setCurrentBadge: (badge) => set({ currentBadge: badge }),
	setUserRegion: (region) => set({ userRegion: region }),
	incrementMatchAttempts: () =>
		set((state) => ({ matchAttempts: state.matchAttempts + 1 })),
	resetMatchAttempts: () => set({ matchAttempts: 0 }),
	reset: () =>
		set({
			currentMatch: null,
			currentBadge: null,
			matchAttempts: 0,
		}),
}));
