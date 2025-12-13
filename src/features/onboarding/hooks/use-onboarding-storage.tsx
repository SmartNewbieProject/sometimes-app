import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingStorage } from '../types';

const ONBOARDING_STORAGE_KEY = '@sometime:user:state';

export const useOnboardingStorage = () => {
  const saveOnboardingComplete = useCallback(async () => {
    try {
      const data: OnboardingStorage = {
        hasSeenOnboarding: true,
        completedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save onboarding completion:', error);
    }
  }, []);

  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!value) return false;

      const data: OnboardingStorage = JSON.parse(value);
      return data.hasSeenOnboarding === true;
    } catch (error) {
      console.warn('Failed to check onboarding status:', error);
      return false;
    }
  }, []);

  return {
    saveOnboardingComplete,
    checkOnboardingStatus,
  };
};
