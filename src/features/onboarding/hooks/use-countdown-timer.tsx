import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { calculateNextMatchTime, formatCountdown } from '../utils/calculate-next-match';

export const useCountdownTimer = () => {
  const [countdown, setCountdown] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  const updateCountdown = () => {
    const nextMatchTime = calculateNextMatchTime();
    const formattedCountdown = formatCountdown(nextMatchTime);
    setCountdown(formattedCountdown);
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

  return { countdown };
};
