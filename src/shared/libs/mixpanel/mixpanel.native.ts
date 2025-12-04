/**
 * Mixpanel 네이티브 구현 (iOS/Android)
 * mixpanel-react-native 사용
 */

import { Mixpanel } from 'mixpanel-react-native';
import type { MixpanelAdapter } from './types';

class MixpanelNative implements MixpanelAdapter {
  private initialized = false;

  init(token: string, trackAutomaticEvents = true): void {
    try {
      Mixpanel.init(token, trackAutomaticEvents);
      this.initialized = true;
      console.log('[Mixpanel Native] Initialized successfully');
    } catch (error) {
      console.error('[Mixpanel Native] Initialization error:', error);
    }
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Native] Not initialized, skipping track');
      return;
    }

    try {
      Mixpanel.track(eventName, properties || {});
    } catch (error) {
      console.error('[Mixpanel Native] Track error:', error);
    }
  }

  identify(userId: string): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Native] Not initialized, skipping identify');
      return;
    }

    try {
      Mixpanel.identify(userId);
    } catch (error) {
      console.error('[Mixpanel Native] Identify error:', error);
    }
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Native] Not initialized, skipping setUserProperties');
      return;
    }

    try {
      Mixpanel.getPeople().set(properties);
    } catch (error) {
      console.error('[Mixpanel Native] SetUserProperties error:', error);
    }
  }

  reset(): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Native] Not initialized, skipping reset');
      return;
    }

    try {
      Mixpanel.reset();
    } catch (error) {
      console.error('[Mixpanel Native] Reset error:', error);
    }
  }
}

export const mixpanelAdapter = new MixpanelNative();
