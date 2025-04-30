import { Platform } from 'react-native';
import { InfiniteScrollOptions } from './types';
import { InfiniteScrollStrategy } from './strategies/infinite-scroll-strategy';
import { WebInfiniteScrollStrategy } from './strategies/web-infinite-scroll-strategy';
import { NativeInfiniteScrollStrategy } from './strategies/native-infinite-scroll-strategy';

export class InfiniteScrollProvider {
  private strategy: InfiniteScrollStrategy;

  constructor(customStrategy?: InfiniteScrollStrategy) {
    if (customStrategy) {
      this.strategy = customStrategy;
    } else {
      this.strategy = Platform.OS === 'web'
        ? new WebInfiniteScrollStrategy()
        : new NativeInfiniteScrollStrategy();
    }
  }

  setupScroll(callback: () => void, options: InfiniteScrollOptions = {}): void {
    this.strategy.setupScroll(callback, options);
  }
  cleanupScroll(): void {
    this.strategy.cleanupScroll();
  }

  getScrollProps(): any {
    return this.strategy.getScrollProps();
  }

  getStrategy(): InfiniteScrollStrategy {
    return this.strategy;
  }

  setStrategy(strategy: InfiniteScrollStrategy): void {
    this.cleanupScroll();
    this.strategy = strategy;
  }

}
