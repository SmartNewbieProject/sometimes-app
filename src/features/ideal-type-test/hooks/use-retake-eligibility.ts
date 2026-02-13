import { useMyResult } from '../queries';
import type { LanguageCode } from '../types';

const RETAKE_COOLDOWN_DAYS = 7;

export const useRetakeEligibility = ({
	lang = 'ko',
	enabled = true,
}: {
	lang?: LanguageCode;
	enabled?: boolean;
}) => {
	const { data: myResult, isLoading } = useMyResult({ lang, enabled });

	if (!myResult?.completedAt) {
		return {
			canRetake: true,
			daysUntilRetake: 0,
			hasResult: !!myResult?.result,
			isLoading,
		};
	}

	const completedAt = new Date(myResult.completedAt);
	const now = new Date();
	const diffMs = now.getTime() - completedAt.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const canRetake = diffDays >= RETAKE_COOLDOWN_DAYS;
	const daysUntilRetake = canRetake ? 0 : RETAKE_COOLDOWN_DAYS - diffDays;

	return {
		canRetake,
		daysUntilRetake,
		hasResult: !!myResult?.result,
		isLoading,
	};
};
