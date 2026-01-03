import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import useSignupProgress, { type SignupSteps } from "./use-signup-progress";

export default function useChangePhase(phase: SignupSteps) {
  const { updateStep } = useSignupProgress();

  const initialize = useCallback(() => {
    updateStep(phase);
  }, [updateStep]);

  useFocusEffect(
    useCallback(() => {
      initialize();
    }, [initialize])
  );
}
