import { useRef } from 'react';
import { FlatList } from 'react-native';
import { InfiniteScrollOptions } from '../types';
import { InfiniteScrollStrategy } from './infinite-scroll-strategy';

export class NativeInfiniteScrollStrategy implements InfiniteScrollStrategy {
  private callback: (() => void) | null = null;
  private options: InfiniteScrollOptions = {};
  private isEndReachedCalledDuringMomentum = false;

  setupScroll = (callback: () => void, options: InfiniteScrollOptions): void => {
    this.callback = callback;
    this.options = options;
    this.isEndReachedCalledDuringMomentum = false;
  };

  cleanupScroll = (): void => {
    this.callback = null;
    this.isEndReachedCalledDuringMomentum = false;
  };

  getScrollProps = (): any => {
    const threshold = this.options.threshold || 0.5;
    const enabled = this.options.enabled !== false;

    return {
      onEndReachedThreshold: threshold,
      onEndReached: enabled
        ? () => {
          if (!this.isEndReachedCalledDuringMomentum && this.callback) {
            this.callback();
            this.isEndReachedCalledDuringMomentum = true;
          }
        }
        : undefined,
      onMomentumScrollBegin: () => {
        this.isEndReachedCalledDuringMomentum = false;
      },
    };
  };
}

export const useFlatListRef = <T>() => {
  return useRef<FlatList<T>>(null);
};
