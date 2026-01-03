import { useCallback, useRef } from 'react';
import { useModal } from '@/src/shared/hooks/use-modal';
import { storage } from '@/src/shared/libs/store';
import { isWeb } from '@/src/shared/libs/platform-utils';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { AppInstallPromptContent } from '../ui/app-install-prompt-content';
import { STORAGE_KEYS, type AppInstallPromptVariant } from '../types';
import React from 'react';

const NAV_CLICK_THRESHOLD = 3;

interface UseAppInstallPromptReturn {
  showPromptForNavClick: () => Promise<void>;
  showPromptForMatching: () => void;
  showPromptForCommunity: () => void;
  incrementNavClickCount: () => Promise<boolean>;
}

export const useAppInstallPrompt = (): UseAppInstallPromptReturn => {
  const { showModal, hideModal } = useModal();
  const { trackEvent } = useMixpanel();
  const isShowingRef = useRef(false);

  const trackPromptShown = useCallback(
    (variant: AppInstallPromptVariant) => {
      trackEvent('App_Install_Prompt_Shown', {
        variant,
        platform: 'web',
      }, { validate: false });
    },
    [trackEvent]
  );

  const trackPromptInstallClicked = useCallback(
    (variant: AppInstallPromptVariant, store: 'ios' | 'android') => {
      trackEvent('App_Install_Prompt_Install_Clicked', {
        variant,
        store,
        platform: 'web',
      }, { validate: false });
    },
    [trackEvent]
  );

  const trackPromptDismissed = useCallback(
    (variant: AppInstallPromptVariant) => {
      trackEvent('App_Install_Prompt_Dismissed', {
        variant,
        platform: 'web',
      }, { validate: false });
    },
    [trackEvent]
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
    [showModal, hideModal, trackPromptShown, trackPromptInstallClicked, trackPromptDismissed]
  );

  const incrementNavClickCount = useCallback(async (): Promise<boolean> => {
    if (!isWeb) return false;

    try {
      const alreadyShown = await storage.getItem(STORAGE_KEYS.NAV_PROMPT_SHOWN);
      if (alreadyShown === 'true') return false;

      const currentCountStr = await storage.getItem(STORAGE_KEYS.NAV_CLICK_COUNT);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
      const newCount = currentCount + 1;

      await storage.setItem(STORAGE_KEYS.NAV_CLICK_COUNT, String(newCount));

      if (newCount >= NAV_CLICK_THRESHOLD) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, []);

  const showPromptForNavClick = useCallback(async () => {
    if (!isWeb) return;

    try {
      const alreadyShown = await storage.getItem(STORAGE_KEYS.NAV_PROMPT_SHOWN);
      if (alreadyShown === 'true') return;

      await storage.setItem(STORAGE_KEYS.NAV_PROMPT_SHOWN, 'true');
      showPrompt('nav_click');
    } catch {
      // ignore
    }
  }, [showPrompt]);

  const showPromptForMatching = useCallback(() => {
    showPrompt('matching');
  }, [showPrompt]);

  const showPromptForCommunity = useCallback(() => {
    showPrompt('community');
  }, [showPrompt]);

  return {
    showPromptForNavClick,
    showPromptForMatching,
    showPromptForCommunity,
    incrementNavClickCount,
  };
};
