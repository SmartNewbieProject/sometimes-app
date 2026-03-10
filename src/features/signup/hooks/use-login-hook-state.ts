import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useCallback, useRef, useState } from 'react';

export type Phase = 'idle' | 'result';

export interface SelectedUniv {
	id: string;
	name: string;
	code: string;
	region: string;
}

export function useLoginHookState() {
	const [phase, setPhase] = useState<Phase>('idle');
	const [selectedUniv, setSelectedUniv] = useState<SelectedUniv | null>(null);
	const [sheetVisible, setSheetVisible] = useState(false);
	const sheetOpenTimeRef = useRef<number | null>(null);

	const openSheet = useCallback(() => {
		setSheetVisible(true);
		sheetOpenTimeRef.current = Date.now();
		mixpanelAdapter.track(MIXPANEL_EVENTS.LOGIN_HOOK_CTA_TAPPED, {
			phase: 'idle',
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	}, []);

	const closeSheet = useCallback(() => {
		setSheetVisible(false);
	}, []);

	const selectUniversity = useCallback((univ: SelectedUniv) => {
		const timeToSelect = sheetOpenTimeRef.current
			? Math.round((Date.now() - sheetOpenTimeRef.current) / 1000)
			: undefined;
		sheetOpenTimeRef.current = null;

		setSelectedUniv(univ);
		setPhase('result');
		setSheetVisible(false);

		mixpanelAdapter.track(MIXPANEL_EVENTS.LOGIN_HOOK_UNIVERSITY_SELECTED, {
			university_id: univ.id,
			university_name: univ.name,
			university_code: univ.code,
			region: univ.region,
			time_to_select_seconds: timeToSelect,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	}, []);

	const reset = useCallback(() => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.LOGIN_HOOK_RESET, {
			university_id: selectedUniv?.id,
			university_name: selectedUniv?.name,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
		setPhase('idle');
		setSelectedUniv(null);
	}, [selectedUniv]);

	return {
		phase,
		selectedUniv,
		sheetVisible,
		openSheet,
		closeSheet,
		selectUniversity,
		reset,
	};
}
