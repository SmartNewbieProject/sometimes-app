import { create } from 'zustand';

interface GlobalLoadingState {
	isLoading: boolean;
	loadingCount: number;
	disabled: boolean;
	setLoading: (loading: boolean) => void;
	incrementLoading: () => void;
	decrementLoading: () => void;
	disableGlobalLoading: () => void;
	enableGlobalLoading: () => void;
}

export const useGlobalLoadingStore = create<GlobalLoadingState>((set, get) => ({
	isLoading: false,
	loadingCount: 0,
	disabled: false,
	setLoading: (loading) => {
		if (get().disabled) return;
		set({ isLoading: loading });
	},
	incrementLoading: () =>
		set((state) => {
			if (state.disabled) return state;
			const newCount = state.loadingCount + 1;
			return { loadingCount: newCount, isLoading: newCount > 0 };
		}),
	decrementLoading: () =>
		set((state) => {
			if (state.disabled) return state;
			const newCount = Math.max(0, state.loadingCount - 1);
			return { loadingCount: newCount, isLoading: newCount > 0 };
		}),
	disableGlobalLoading: () => set({ disabled: true, isLoading: false }),
	enableGlobalLoading: () => set({ disabled: false }),
}));
