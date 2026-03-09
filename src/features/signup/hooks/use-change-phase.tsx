import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { InteractionManager } from 'react-native';
import useSignupProgress, { type SignupSteps } from './use-signup-progress';

export default function useChangePhase(phase: SignupSteps) {
	const { updateStep } = useSignupProgress();

	useFocusEffect(
		useCallback(() => {
			const task = InteractionManager.runAfterInteractions(() => {
				updateStep(phase);
			});
			return () => task.cancel();
		}, [updateStep, phase]),
	);
}
