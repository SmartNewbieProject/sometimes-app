import { useState } from 'react';
import type { GlobalPreferenceCategory } from '../types';

export function useOnboardingPreferences(categories: GlobalPreferenceCategory[]) {
	const [currentStep, setCurrentStep] = useState(0);
	const [selections, setSelections] = useState<Record<string, string[]>>({});

	const currentCategory = categories[currentStep];
	const totalSteps = categories.length;
	const progress = totalSteps > 0 ? (currentStep + 1) / totalSteps : 0;
	const isLastStep = currentStep >= totalSteps - 1;

	const select = (categoryId: string, optionId: string) => {
		setSelections((prev) => {
			const category = categories.find((c) => c.optionId === categoryId);
			if (!category) return prev;

			const current = prev[categoryId] ?? [];

			if (!category.multiple) {
				return { ...prev, [categoryId]: [optionId] };
			}

			const isSelected = current.includes(optionId);
			if (isSelected) {
				return { ...prev, [categoryId]: current.filter((id) => id !== optionId) };
			}

			if (current.length >= category.maximumChoiceCount) {
				return { ...prev, [categoryId]: [...current.slice(1), optionId] };
			}

			return { ...prev, [categoryId]: [...current, optionId] };
		});
	};

	const currentSelections = currentCategory ? (selections[currentCategory.optionId] ?? []) : [];
	const isCurrentStepValid = currentSelections.length > 0;

	const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
	const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

	const getPreferenceOptionIds = (): string[] => Object.values(selections).flat();

	const reset = () => {
		setCurrentStep(0);
		setSelections({});
	};

	return {
		currentStep,
		currentCategory,
		totalSteps,
		progress,
		isLastStep,
		selections,
		select,
		isCurrentStepValid,
		nextStep,
		prevStep,
		getPreferenceOptionIds,
		reset,
	};
}
