/**
 * High Priority Mixpanel Tracking Hook
 * 2025-12-29 추가
 */

import { useMemo } from 'react';
import { MixpanelTracker } from '../libs/mixpanel-tracking';

export const useTracking = () => {
	const tracker = useMemo(() => {
		return new MixpanelTracker(null);
	}, []);

	return tracker;
};
