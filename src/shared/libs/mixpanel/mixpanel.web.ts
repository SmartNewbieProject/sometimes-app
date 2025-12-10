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

    try {
      mixpanel.track(eventName, properties || {});
    } catch (error) {
      console.error('[Mixpanel Web] Track error:', error);
    }
  }

  identify(userId: string): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Web] Not initialized, skipping identify');
      return;
    }

    try {
      mixpanel.identify(userId);
    } catch (error) {
      console.error('[Mixpanel Web] Identify error:', error);
    }
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Web] Not initialized, skipping setUserProperties');
      return;
    }

    try {
      mixpanel.people.set(properties);
    } catch (error) {
      console.error('[Mixpanel Web] SetUserProperties error:', error);
    }
  }

  reset(): void {
    if (!this.initialized) {
      console.warn('[Mixpanel Web] Not initialized, skipping reset');
      return;
    }

    try {
      mixpanel.reset();
    } catch (error) {
      console.error('[Mixpanel Web] Reset error:', error);
    }
  }
}

export const mixpanelAdapter = new MixpanelWeb();
