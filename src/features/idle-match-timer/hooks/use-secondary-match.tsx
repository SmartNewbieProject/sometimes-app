import { create } from 'zustand';
import type { MatchDetailsV31 } from '../types-v31';

type Store = {
	secondary: MatchDetailsV31 | null;
	setSecondary: (v: MatchDetailsV31 | null) => void;
	notFoundMatch: MatchDetailsV31 | null;
	setNotFoundMatch: (v: MatchDetailsV31 | null) => void;
};

export const useSecondaryMatch = create<Store>((set) => ({
	secondary: null,
	setSecondary: (secondary) => set({ secondary }),
	notFoundMatch: null,
	setNotFoundMatch: (notFoundMatch) => set({ notFoundMatch }),
}));
