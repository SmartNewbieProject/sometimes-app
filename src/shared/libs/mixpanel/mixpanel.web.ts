/**
 * Mixpanel 웹 구현
 * mixpanel-browser 사용
 */

import mixpanel from 'mixpanel-browser';
import type { MixpanelAdapter } from './types';

class MixpanelWeb implements MixpanelAdapter {
  private initialized = false;

  init(token: string, trackAutomaticEvents = true): void {
    try {
      mixpanel.init(token, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: trackAutomaticEvents,
        persistence: 'localStorage',
        record_sessions_percent: 100,
        record_mask_all_text: true,
        record_mask_all_inputs: true,
      });
      this.initialized = true;
      console.log('[Mixpanel Web] Initialized successfully');
    } catch (error) {
      console.error('[Mixpanel Web] Initialization error:', error);
    }
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Web] Not initialized, skipping track');
      return;
    }

    // eventName 유효성 검사
    if (!eventName || typeof eventName !== 'string' || eventName.trim() === '') {
      console.error('[Mixpanel Web] Invalid eventName:', {
        eventName,
        type: typeof eventName,
        properties,
      });
      return;
    }

    try {
      console.log('[Mixpanel Web] Tracking event:', {
        eventName,
        properties: properties || {},
      });
      mixpanel.track(eventName, properties || {});
    } catch (error) {
      console.error('[Mixpanel Web] Track error:', {
        eventName,
        properties,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  identify(userId: string): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Web] Not initialized, skipping identify');
      return;
    }

    if (!userId || typeof userId !== 'string') {
      console.error('[Mixpanel Web] Invalid userId:', {
        userId,
        type: typeof userId,
      });
      return;
    }

    try {
      console.log('[Mixpanel Web] Identifying user:', userId);
      mixpanel.identify(userId);
    } catch (error) {
      console.error('[Mixpanel Web] Identify error:', {
        userId,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Web] Not initialized, skipping setUserProperties');
      return;
    }

    if (!properties || typeof properties !== 'object') {
      console.error('[Mixpanel Web] Invalid properties:', {
        properties,
        type: typeof properties,
      });
      return;
    }

    try {
      console.log('[Mixpanel Web] Setting user properties:', properties);
      mixpanel.people.set(properties);
    } catch (error) {
      console.error('[Mixpanel Web] SetUserProperties error:', {
        properties,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  registerSuperProperties(properties: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Web] Not initialized, skipping registerSuperProperties');
      return;
    }

    if (!properties || typeof properties !== 'object') {
      console.error('[Mixpanel Web] Invalid properties:', {
        properties,
        type: typeof properties,
      });
      return;
    }

    try {
      console.log('[Mixpanel Web] Registering super properties:', properties);
      mixpanel.register(properties);
    } catch (error) {
      console.error('[Mixpanel Web] RegisterSuperProperties error:', {
        properties,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  reset(): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Web] Not initialized, skipping reset');
      return;
    }

    try {
      console.log('[Mixpanel Web] Resetting user');
      mixpanel.reset();
    } catch (error) {
      console.error('[Mixpanel Web] Reset error:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const mixpanelAdapter = new MixpanelWeb();
