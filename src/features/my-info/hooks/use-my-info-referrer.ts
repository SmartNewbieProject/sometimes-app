import { create } from 'zustand';

type MyInfoReferrer = 'home' | 'signup' | null;

interface MyInfoReferrerState {
	referrer: MyInfoReferrer;
	setReferrer: (referrer: MyInfoReferrer) => void;
	clear: () => void;
}

export const useMyInfoReferrer = create<MyInfoReferrerState>((set) => ({
	referrer: null,
	setReferrer: (referrer) => set({ referrer }),
	clear: () => set({ referrer: null }),
}));
