import { useState, useCallback, useEffect, useRef } from 'react';
import { storage } from '../libs';

interface StorageProps<T> {
  key: string;
  initialValue?: T;
}

export function useStorage<T>({ key, initialValue }: StorageProps<T>) {
  const initialValueRef = useRef(initialValue);
  const [storedValue, setStoredValue] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setLoading(true);
        const item = await storage.getItem(key);
        const value = (() => {
          return item ? JSON.parse(item) : initialValueRef.current;
        })();
        // console.log({ value });
        setStoredValue(value);
        setError(null);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e : new Error('Failed to load value'));
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  const setValue = useCallback(async (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      await storage.setItem(key, JSON.stringify(valueToStore));

      setStoredValue(prevValue => {
        const isSameValue = JSON.stringify(prevValue) === JSON.stringify(valueToStore);
        return isSameValue ? prevValue : valueToStore;
      });
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
