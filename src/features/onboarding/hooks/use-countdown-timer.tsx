import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import {
  calculateNextMatchTime,
  formatCountdown,
  getCountdownParts,
  CountdownParts,
} from '../utils/calculate-next-match';

export const useCountdownTimer = () => {
  const [countdown, setCountdown] = useState('');
  const [countdownParts, setCountdownParts] = useState<CountdownParts>({
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);

  const updateCountdown = () => {
    const nextMatchTime = calculateNextMatchTime();
    const formattedCountdown = formatCountdown(nextMatchTime);
    const parts = getCountdownParts(nextMatchTime);
    setCountdown(formattedCountdown);
    setCountdownParts(parts);
  };

  useEffect(() => {
    updateCountdown();

    intervalRef.current = setInterval(updateCountdown, 1000);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        updateCountdown();
      }
      appState.current = nextAppState;
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, []);

  return { countdown, countdownParts };
};
