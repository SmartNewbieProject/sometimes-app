import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { useModal } from '@/src/shared/hooks/use-modal';
import { isWeb } from '@/src/shared/libs/platform-utils';
import { storage } from '@/src/shared/libs/store';
import { useCallback, useRef } from 'react';
import React from 'react';
import { type AppInstallPromptVariant, PROMPT_COOLDOWN_MS, STORAGE_KEYS } from '../types';
import { AppInstallPromptContent } from '../ui/app-install-prompt-content';

const NAV_CLICK_THRESHOLD = 3;

interface UseAppInstallPromptReturn {
	showPromptForNavClick: () => Promise<void>;
	showPromptForMatching: () => Promise<void>;
	showPromptForCommunity: () => Promise<void>;
	incrementNavClickCount: () => Promise<boolean>;
}

export const useAppInstallPrompt = (): UseAppInstallPromptReturn => {
	const { showModal, hideModal } = useModal();
	const { trackEvent } = useMixpanel();
	const isShowingRef = useRef(false);

	const trackPromptShown = useCallback(
		(variant: AppInstallPromptVariant) => {
			trackEvent(
				'App_Install_Prompt_Shown',
				{
					variant,
					platform: 'web',
				},
				{ validate: false },
			);
		},
		[trackEvent],
	);

	const trackPromptInstallClicked = useCallback(
		(variant: AppInstallPromptVariant, store: 'ios' | 'android') => {
			trackEvent(
				'App_Install_Prompt_Install_Clicked',
				{
					variant,
					store,
					platform: 'web',
				},
				{ validate: false },
			);
		},
		[trackEvent],
	);

	const trackPromptDismissed = useCallback(
		(variant: AppInstallPromptVariant) => {
			trackEvent(
				'App_Install_Prompt_Dismissed',
				{
					variant,
					platform: 'web',
				},
				{ validate: false },
			);
		},
		[trackEvent],
	);

	const showPrompt = useCallback(
		(variant: AppInstallPromptVariant) => {
			if (!isWeb || isShowingRef.current) return;

			isShowingRef.current = true;
			trackPromptShown(variant);

			showModal({
				showLogo: true,
				dismissable: true,
				custom: () =>
					React.createElement(AppInstallPromptContent, {
						variant,
						onInstallPress: (store: 'ios' | 'android') => {
							trackPromptInstallClicked(variant, store);
							hideModal();
							isShowingRef.current = false;
						},
						onDismiss: () => {
							trackPromptDismissed(variant);
							hideModal();
							isShowingRef.current = false;
						},
					}),
			});
		},
		[showModal, hideModal, trackPromptShown, trackPromptInstallClicked, trackPromptDismissed],
	);

	const isPromptInCooldown = useCallback(async (storageKey: string) => {
		try {
			const lastShownStr = await storage.getItem(storageKey);
			if (!lastShownStr) {
				return false;
			}

			const lastShown = Number.parseInt(lastShownStr, 10);
			return Number.isFinite(lastShown) && Date.now() - lastShown < PROMPT_COOLDOWN_MS;
		} catch {
			return true;
		}
	}, []);

	const markPromptShownAt = useCallback(async (storageKey: string) => {
		try {
			await storage.setItem(storageKey, String(Date.now()));
		} catch {
			// ignore storage errors
		}
	}, []);

	const incrementNavClickCount = useCallback(async (): Promise<boolean> => {
		if (!isWeb) return false;

		try {
			if (await isPromptInCooldown(STORAGE_KEYS.NAV_LAST_SHOWN)) {
				return false;
			}

			const alreadyShown = await storage.getItem(STORAGE_KEYS.NAV_PROMPT_SHOWN);
			if (alreadyShown === 'true') {
				await markPromptShownAt(STORAGE_KEYS.NAV_LAST_SHOWN);
				await storage.removeItem(STORAGE_KEYS.NAV_PROMPT_SHOWN);
				return false;
			}

			const currentCountStr = await storage.getItem(STORAGE_KEYS.NAV_CLICK_COUNT);
			const currentCount = currentCountStr ? Number.parseInt(currentCountStr, 10) : 0;
			const newCount = currentCount + 1;

			await storage.setItem(STORAGE_KEYS.NAV_CLICK_COUNT, String(newCount));

			if (newCount >= NAV_CLICK_THRESHOLD) {
				return true;
			}

			return false;
		} catch {
			return false;
		}
	}, [isPromptInCooldown, markPromptShownAt]);

	const showPromptForNavClick = useCallback(async () => {
		if (!isWeb) return;

		try {
			if (await isPromptInCooldown(STORAGE_KEYS.NAV_LAST_SHOWN)) {
				return;
			}

			const alreadyShown = await storage.getItem(STORAGE_KEYS.NAV_PROMPT_SHOWN);
			if (alreadyShown === 'true') {
				await storage.removeItem(STORAGE_KEYS.NAV_PROMPT_SHOWN);
			}

			await markPromptShownAt(STORAGE_KEYS.NAV_LAST_SHOWN);
			await storage.removeItem(STORAGE_KEYS.NAV_CLICK_COUNT);
			showPrompt('nav_click');
		} catch {
			// ignore
		}
	}, [isPromptInCooldown, markPromptShownAt, showPrompt]);

	const showPromptWithCooldown = useCallback(
		async (variant: 'matching' | 'community', storageKey: string) => {
			if (!isWeb) return;
			if (await isPromptInCooldown(storageKey)) {
				return;
			}

			await markPromptShownAt(storageKey);
			showPrompt(variant);
		},
		[isPromptInCooldown, markPromptShownAt, showPrompt],
	);

	const showPromptForMatching = useCallback(
		() => showPromptWithCooldown('matching', STORAGE_KEYS.MATCHING_LAST_SHOWN),
		[showPromptWithCooldown],
	);

	const showPromptForCommunity = useCallback(
		() => showPromptWithCooldown('community', STORAGE_KEYS.COMMUNITY_LAST_SHOWN),
		[showPromptWithCooldown],
	);

	return {
		showPromptForNavClick,
		showPromptForMatching,
		showPromptForCommunity,
		incrementNavClickCount,
	};
};
