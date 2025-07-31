import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { type SignupSteps, useSignupProgress } from "../hooks";

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
