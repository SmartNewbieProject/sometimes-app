import React from 'react';
import { ChallengeProgress } from './challenge-progress';
import { CompletedCard } from './completed-card';
import { DayIndicator } from './day-indicator';

interface ChallengeCardProps {
	answeredThisWeek: number;
	dayOfWeek: number;
	canProceed: boolean;
	hasTodayAnswer: boolean;
}

export const ChallengeCard = ({
	answeredThisWeek,
	dayOfWeek,
	canProceed,
	hasTodayAnswer,
}: ChallengeCardProps) => {
	if (answeredThisWeek >= 5) {
		return <CompletedCard />;
	}

	return (
		<>
			<ChallengeProgress
				answeredThisWeek={answeredThisWeek}
				canProceed={canProceed}
				hasTodayAnswer={hasTodayAnswer}
			/>
			<DayIndicator
				answeredThisWeek={answeredThisWeek}
				dayOfWeek={dayOfWeek}
				hasTodayAnswer={hasTodayAnswer}
			/>
		</>
	);
};
