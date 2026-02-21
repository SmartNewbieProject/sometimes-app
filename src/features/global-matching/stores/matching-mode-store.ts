import { storage } from '@/src/shared/libs';
import { create } from 'zustand';

export type MatchingMode = 'DOMESTIC' | 'GLOBAL';

const STORAGE_KEY = 'matching-mode';

interface MatchingModeState {
	mode: MatchingMode;
	isInitialized: boolean;
	setMode: (mode: MatchingMode) => void;
	toggleMode: () => void;
	initialize: () => Promise<void>;
}

export const useMatchingModeStore = create<MatchingModeState>((set, get) => ({
	mode: 'DOMESTIC',
	isInitialized: false,

	setMode: (mode) => {
		set({ mode });
		storage.setItem(STORAGE_KEY, mode);
	},

	toggleMode: () => {
		const newMode = get().mode === 'DOMESTIC' ? 'GLOBAL' : 'DOMESTIC';
		set({ mode: newMode });
		storage.setItem(STORAGE_KEY, newMode);
	},

	initialize: async () => {
		const saved = await storage.getItem(STORAGE_KEY);
		if (saved === 'GLOBAL' || saved === 'DOMESTIC') {
			set({ mode: saved, isInitialized: true });
		} else {
			set({ isInitialized: true });
		}
	},
}));
