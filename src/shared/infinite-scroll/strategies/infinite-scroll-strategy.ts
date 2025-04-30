import { InfiniteScrollOptions } from '../types';

export interface InfiniteScrollStrategy {
  setupScroll: (
    callback: () => void,
    options: InfiniteScrollOptions
  ) => void;

  cleanupScroll: () => void;

  getScrollProps: () => any;
}
