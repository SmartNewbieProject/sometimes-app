import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import {
  calculateNextMatchTime,
  formatCountdown,
  getCountdownParts,
  CountdownParts,
} from '../utils/calculate-next-match';

const getMillisUntilNextMinute = () => {
  const now = new Date();
  return (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
};

export const useCountdownTimer = () => {
  const [countdown, setCountdown] = useState('');
  const [countdownParts, setCountdownParts] = useState<CountdownParts>({
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appState = useRef(AppState.currentState);

  const updateCountdown = useCallback(() => {
    const nextMatchTime = calculateNextMatchTime();
    setCountdown(formatCountdown(nextMatchTime));
    setCountdownParts(getCountdownParts(nextMatchTime));
  }, []);

  const scheduleNextUpdate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateCountdown();
      scheduleNextUpdate();
    }, getMillisUntilNextMinute());
  }, [updateCountdown]);

  useEffect(() => {
    updateCountdown();
    scheduleNextUpdate();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        updateCountdown();
        scheduleNextUpdate();
      }
      appState.current = nextAppState;
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.remove();
    };
  }, [updateCountdown, scheduleNextUpdate]);

  return { countdown, countdownParts };
};
