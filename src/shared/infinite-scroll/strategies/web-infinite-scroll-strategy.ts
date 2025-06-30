import { useRef } from 'react';
import { InfiniteScrollOptions } from '../types';
import { InfiniteScrollStrategy } from './infinite-scroll-strategy';

export class WebInfiniteScrollStrategy implements InfiniteScrollStrategy {
  private observer: IntersectionObserver | null = null;
  private callback: (() => void) | null = null;
  private options: InfiniteScrollOptions = {};
  private lastItemRef: React.RefObject<HTMLElement> | null = null;
  private isCallbackCalled = false;
  private callbackTimeout: NodeJS.Timeout | null = null;
  private observerUpdateTimeout: NodeJS.Timeout | null = null;

  setupScroll(callback: () => void, options: InfiniteScrollOptions) {
    this.callback = callback;
    this.options = options;
    this.lastItemRef = options.lastItemRef || null;

    this.cleanupScroll();

    if (options.enabled === false) {
      return;
    }

    const threshold = options.threshold || 0.5;

    this.observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];

        const intersection = lastEntry && lastEntry.isIntersecting && !this.isCallbackCalled;
        if (!intersection) {
          return;
        }

        this.isCallbackCalled = true;

        if (this.callbackTimeout) {
          clearTimeout(this.callbackTimeout);
        }

        this.callbackTimeout = setTimeout(() => {
          if (this.callback) {
            this.callback();
            if (this.observerUpdateTimeout) {
              clearTimeout(this.observerUpdateTimeout);
            }
            this.observerUpdateTimeout = setTimeout(() => {
              this.updateObserver();
              this.isCallbackCalled = false;
            }, 1000);
          }
        }, 100);
      },
      {
        root: null,
        rootMargin: '200px',
        threshold,
      }
    );

    this.updateObserver();
  };

  cleanupScroll = (): void => {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.callbackTimeout) {
      clearTimeout(this.callbackTimeout);
      this.callbackTimeout = null;
    }

    if (this.observerUpdateTimeout) {
      clearTimeout(this.observerUpdateTimeout);
      this.observerUpdateTimeout = null;
    }
  };

  updateObserver = (): void => {
    if (!this.observer || !this.lastItemRef?.current) {
      setTimeout(() => {
        if (this.isCallbackCalled) {
          this.isCallbackCalled = false;
        }
      }, 3000);

      return;
    }

    this.observer.disconnect();
    this.observer.observe(this.lastItemRef.current);
    this.isCallbackCalled = false;
  };

  getScrollProps = (): any => {
    return {};
  };
}

export const useLastItemRef = () => {
  return useRef<HTMLDivElement>(null);
};
