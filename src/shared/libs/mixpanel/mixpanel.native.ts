/**
 * Mixpanel 네이티브 구현 (iOS/Android)
 * mixpanel-react-native 사용
 */

import { Mixpanel } from 'mixpanel-react-native';
import type { MixpanelAdapter } from './types';

class MixpanelNative implements MixpanelAdapter {
  private initialized = false;
  private mixpanel: Mixpanel | null = null;

  init(token: string, trackAutomaticEvents = true): void {
    try {
      this.mixpanel = new Mixpanel(token, trackAutomaticEvents);
      this.mixpanel.init();
      this.initialized = true;
      console.log('[Mixpanel Native] Initialized successfully');
    } catch (error) {
      console.error('[Mixpanel Native] Initialization error:', error);
    }
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.initialized || !this.mixpanel) {
      console.warn('[Mixpanel Native] Not initialized, skipping track');
      return;
    }

    // eventName 유효성 검사
    if (!eventName || typeof eventName !== 'string' || eventName.trim() === '') {
      console.error('[Mixpanel Native] Invalid eventName:', {
        eventName,
        type: typeof eventName,
        properties,
      });
      return;
    }

    try {
      console.log('[Mixpanel Native] Tracking event:', {
        eventName,
        properties: properties || {},
      });
      this.mixpanel.track(eventName, properties || {});
    } catch (error) {
      console.error('[Mixpanel Native] Track error:', {
        eventName,
        properties,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  identify(userId: string): void {
    if (!this.initialized || !this.mixpanel) {
      console.warn('[Mixpanel Native] Not initialized, skipping identify');
      return;
    }

    if (!userId || typeof userId !== 'string') {
      console.error('[Mixpanel Native] Invalid userId:', {
        userId,
        type: typeof userId,
      });
      return;
    }

    try {
      console.log('[Mixpanel Native] Identifying user:', userId);
      this.mixpanel.identify(userId);
    } catch (error) {
      console.error('[Mixpanel Native] Identify error:', {
        userId,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized || !this.mixpanel) {
      console.warn('[Mixpanel Native] Not initialized, skipping setUserProperties');
      return;
    }

    if (!properties || typeof properties !== 'object') {
      console.error('[Mixpanel Native] Invalid properties:', {
        properties,
        type: typeof properties,
      });
      return;
    }

    try {
      console.log('[Mixpanel Native] Setting user properties:', properties);
      this.mixpanel.getPeople().set(properties);
    } catch (error) {
      console.error('[Mixpanel Native] SetUserProperties error:', {
        properties,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  reset(): void {
    if (!this.initialized || !this.mixpanel) {
      console.warn('[Mixpanel Native] Not initialized, skipping reset');
      return;
    }

    try {
      console.log('[Mixpanel Native] Resetting user');
      this.mixpanel.reset();
    } catch (error) {
      console.error('[Mixpanel Native] Reset error:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const mixpanelAdapter = new MixpanelNative();
