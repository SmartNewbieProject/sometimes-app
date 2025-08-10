import { useEffect, useRef, useState, useMemo } from 'react';
import dayUtils from '@/src/shared/libs/day';
import type { ConfigType } from 'dayjs';

export const getRemainingSeconds = (endTime: string | Date | ConfigType): number => {
  const end = dayUtils.create(endTime);
  const now = dayUtils.create();
  const diff = end.diff(now, 'second');
  return Math.max(0, diff);
};

type UseTimerOptions = {
  onComplete?: () => void;
  autoStart?: boolean;
};

export const useTimer = (
  endTime: string | Date | ConfigType | undefined | null,
  options: UseTimerOptions = {}
) => {
  const { onComplete, autoStart = true } = options;
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  const endTimeString = useMemo(() => {
    if (!endTime) return null;
    return typeof endTime === 'string' ? endTime : dayUtils.create(endTime).toISOString();
  }, [endTime]);

  onCompleteRef.current = onComplete;

  const calculateSeconds = () => {
    if (!endTime) return 0;
    const end = dayUtils.create(endTime);
    const now = dayUtils.create();
    const diff = end.diff(now, 'second');
    return Math.max(0, diff);
  };

  const start = () => {
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setSeconds(calculateSeconds());
  };

  const setCallback = (callback: () => void) => {
    onCompleteRef.current = callback;
  };

  useEffect(() => {
    console.log('useTimer - autoStart', options.autoStart);
    if (options.autoStart) {
      start();
    }
  }, [options.autoStart]);

  useEffect(() => {
    console.log('useTimer - endTime', endTime);
    setSeconds(calculateSeconds());
  }, [endTimeString]);

  useEffect(() => {
    console.log('useTimer - isRunning', isRunning);
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const newSeconds = prev - 1;
        if (newSeconds <= 0) {
          setIsRunning(false);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }
        return newSeconds;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    seconds,
    isRunning,
    start,
    stop,
    reset,
    setCallback,
  };
};
