import { useState, useCallback, useEffect } from 'react';
import { storage } from '../libs';

interface StorageProps<T> {
  key: string;
  initialValue?: T;
}

export function useStorage<T>({ key, initialValue }: StorageProps<T>) {
  const [storedValue, setStoredValue] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await storage.getItem(key);
        const value = item ? JSON.parse(item) : initialValue;
        setStoredValue(value);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load value'));
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key, initialValue]);

  const setValue = useCallback(async (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      await storage.setItem(key, JSON.stringify(valueToStore));
      setStoredValue(valueToStore);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to save value'));
    }
  }, [key, storedValue]);

  const removeValue = useCallback(async () => {
    try {
      await storage.removeItem(key);
      setStoredValue(undefined);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to remove value'));
    }
  }, [key]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    loading,
    error,
  };
} 