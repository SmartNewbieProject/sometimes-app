import { useCallback } from 'react';
import { useStorage } from './use-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding-completed';

interface OnboardingCompletedFlag {
  completed: boolean;
  completedAt: number;
}

export function useOnboardingCompleted() {
  const { value, setValue, removeValue, loading } = useStorage<OnboardingCompletedFlag>({
    key: ONBOARDING_COMPLETED_KEY,
  });

  const markAsCompleted = useCallback(async () => {
    await setValue({
      completed: true,
      completedAt: Date.now(),
    });
  }, [setValue]);

  const clearCompletedFlag = useCallback(async () => {
    await removeValue();
  }, [removeValue]);

  const syncWithServerStatus = useCallback(
    async (isPreferenceFilled: boolean) => {
      if (isPreferenceFilled && !value?.completed) {
        await markAsCompleted();
      }
    },
    [value?.completed, markAsCompleted]
  );

  return {
    isCompleted: value?.completed ?? false,
    completedAt: value?.completedAt ?? null,
    loading,
    markAsCompleted,
    clearCompletedFlag,
    syncWithServerStatus,
  };
}
