import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useEffect } from 'react';
import { useMatchingModeStore } from '../stores/matching-mode-store';

export function useMatchingMode() {
	const { mode, isInitialized, setMode, toggleMode, initialize } = useMatchingModeStore();

	useEffect(() => {
		if (!isInitialized) {
			initialize();
		}
	}, [isInitialized, initialize]);

	const handleToggleMode = () => {
		const newMode = mode === 'DOMESTIC' ? 'GLOBAL' : 'DOMESTIC';
		mixpanelAdapter.track('Global_Mode_Switch', {
			from: mode,
			to: newMode,
			timestamp: new Date().toISOString(),
		});
		toggleMode();
	};

	return {
		mode,
		isGlobalMode: mode === 'GLOBAL',
		isDomesticMode: mode === 'DOMESTIC',
		isInitialized,
		setMode,
		toggleMode: handleToggleMode,
	};
}
