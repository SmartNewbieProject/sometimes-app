import { useEffect, useRef } from 'react';
import { AppState, type NativeEventSubscription } from 'react-native';

type MemoryWarningCallback = () => void;

class MemoryWarningManager {
  private lastWarningTime: number | null = null;
  private listeners: Set<MemoryWarningCallback> = new Set();
  private subscription: NativeEventSubscription | null = null;

  private readonly MEMORY_WARNING_COOLDOWN_MS = 30_000;

  constructor() {
    this.setupListener();
  }

  private setupListener() {
    if (this.subscription) return;

    this.subscription = AppState.addEventListener('memoryWarning', () => {
      this.lastWarningTime = Date.now();
      this.listeners.forEach((callback) => callback());
    });
  }

  hasRecentMemoryWarning(): boolean {
    if (!this.lastWarningTime) return false;

    const timeSinceWarning = Date.now() - this.lastWarningTime;
    return timeSinceWarning < this.MEMORY_WARNING_COOLDOWN_MS;
  }

  getTimeSinceLastWarning(): number | null {
    if (!this.lastWarningTime) return null;
    return Date.now() - this.lastWarningTime;
  }

  subscribe(callback: MemoryWarningCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  clearWarning() {
    this.lastWarningTime = null;
  }
}

export const memoryWarningManager = new MemoryWarningManager();

export const useMemoryWarning = (onWarning?: MemoryWarningCallback) => {
  const hasWarning = useRef(memoryWarningManager.hasRecentMemoryWarning());

  useEffect(() => {
    if (!onWarning) return;

    return memoryWarningManager.subscribe(() => {
      hasWarning.current = true;
      onWarning();
    });
  }, [onWarning]);

  return {
    hasRecentWarning: () => memoryWarningManager.hasRecentMemoryWarning(),
    timeSinceLastWarning: () => memoryWarningManager.getTimeSinceLastWarning(),
    clearWarning: () => memoryWarningManager.clearWarning(),
  };
};
