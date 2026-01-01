/**
 * 매칭 효율성 분석 훅
 * 실시간 매칭 성공률/실패율 통계 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/shared/libs/i18n';
import { useQuery } from '@tanstack/react-query';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';

export interface MatchingStatistics {
	totalAttempts: number;
	successfulMatches: number;
	failedAttempts: number;
	successRate: number;
	failureRate: number;
	failureReasons: Record<string, number>;
	recentPerformance: {
		last24Hours: number;
		last7Days: number;
		last30Days: number;
	};
	averageResponseTime: number;
	peakHourPerformance: Record<number, number>;
}

export interface FailureAnalysis {
	type: string;
	count: number;
	percentage: number;
	trend: 'improving' | 'stable' | 'worsening';
	userActionRequired: string;
	preventable: boolean;
}

export const useMatchingEfficiency = () => {
	const { t } = useTranslation();

	const { matchingEvents, matchingEfficiencyEvents } = useMixpanel();
	const [statistics, setStatistics] = useState<MatchingStatistics>({
		totalAttempts: 0,
		successfulMatches: 0,
		failedAttempts: 0,
		successRate: 0,
		failureRate: 0,
		failureReasons: {},
		recentPerformance: {
			last24Hours: 0,
			last7Days: 0,
			last30Days: 0,
		},
		averageResponseTime: 0,
		peakHourPerformance: {},
	});

	// 실시간 성공률 계산
	const calculateSuccessRate = useCallback(
		(totalAttempts: number, successfulMatches: number): number => {
			if (totalAttempts === 0) return 0;
			return Math.round((successfulMatches / totalAttempts) * 100);
		},
		[],
	);

	// 실패 원인 분석
	const analyzeFailureReasons = useCallback(
		(failureData: { type: string; count: number }[]): FailureAnalysis[] => {
			const totalFailures = failureData.reduce((sum, item) => sum + item.count, 0);

			return failureData
				.map((item) => ({
					type: item.type,
					count: item.count,
					percentage: totalFailures > 0 ? Math.round((item.count / totalFailures) * 100) : 0,
					trend: 'stable' as const, // TODO: 히스토리 데이터 기반 트렌드 분석
					userActionRequired: getUserActionForFailure(item.type),
					preventable: isPreventableFailure(item.type),
				}))
				.sort((a, b) => b.count - a.count);
		},
		[],
	);

	// 매칭 시도 이벤트 트래킹
	const trackMatchingAttempt = useCallback(
		(
			connectionId: string,
			context: {
				gemBalance: number;
				timeOfDay: number;
				isPeakTime: boolean;
				userTier?: string;
			},
		) => {
			matchingEfficiencyEvents.trackMatchRequestSent(connectionId, 'like');

			// 통계 업데이트
			setStatistics((prev) => ({
				...prev,
				totalAttempts: prev.totalAttempts + 1,
				successRate: calculateSuccessRate(prev.totalAttempts + 1, prev.successfulMatches),
				failureRate: calculateFailureRate(prev.totalAttempts + 1, prev.failedAttempts),
			}));
		},
		[calculateSuccessRate, matchingEfficiencyEvents],
	);

	// 매칭 성공 이벤트 트래킹
	const trackMatchingSuccess = useCallback(
		(
			connectionId: string,
			context: {
				matchType: 'mutual_like' | 'instant_match';
				responseTime: number;
			},
		) => {
			// KPI 이벤트: 매칭 성공 (User Properties 자동 업데이트 포함)
			matchingEvents.trackMatchingSuccess(connectionId, context.responseTime);

			// 통계 업데이트
			setStatistics((prev) => {
				const newSuccessful = prev.successfulMatches + 1;
				return {
					...prev,
					successfulMatches: newSuccessful,
					successRate: calculateSuccessRate(prev.totalAttempts, newSuccessful),
					averageResponseTime: (prev.averageResponseTime + context.responseTime) / 2,
				};
			});
		},
		[calculateSuccessRate, matchingEvents],
	);

	// 매칭 실패 이벤트 트래킹
	const trackMatchingFailure = useCallback(
		(
			connectionId: string,
			failureReason: {
				type: string;
				category: string;
				userAction: string;
				recoverable: boolean;
				severity: string;
				serverMessage: string;
			},
		) => {
			// KPI 이벤트: 매칭 실패
			matchingEvents.trackMatchingFailed(failureReason.serverMessage, {
				failureCategory: failureReason.category as any,
				isRecoverable: failureReason.recoverable,
			});

			// 통계 업데이트
			setStatistics((prev) => {
				const newFailed = prev.failedAttempts + 1;
				const updatedFailureReasons = {
					...prev.failureReasons,
					[failureReason.type]: (prev.failureReasons[failureReason.type] || 0) + 1,
				};

				return {
					...prev,
					failedAttempts: newFailed,
					failureReasons: updatedFailureReasons,
					failureRate: calculateFailureRate(prev.totalAttempts, newFailed),
				};
			});
		},
		[matchingEvents],
	);

	// 실패율 계산
	const calculateFailureRate = useCallback(
		(totalAttempts: number, failedAttempts: number): number => {
			if (totalAttempts === 0) return 0;
			return Math.round((failedAttempts / totalAttempts) * 100);
		},
		[],
	);

	// 실패 방지 추천 생성
	const generateFailurePreventionRecommendations = useCallback(
		(failureAnalysis: FailureAnalysis[], currentStatistics: MatchingStatistics) => {
			const recommendations: {
				type: 'immediate' | 'short_term' | 'long_term';
				priority: 'high' | 'medium' | 'low';
				action: string;
				expectedImprovement: string;
			}[] = [];

			// 높은 실패율의 경우
			if (currentStatistics.failureRate > 30) {
				recommendations.push({
					type: 'immediate',
					priority: 'high',
					action: t('hooks.사용자_자산_상태_사전_확인_및_안내'),
					expectedImprovement: '15-25% 실패율 감소',
				});
			}

			// 특정 실패 타입이 많은 경우
			const ticketInsufficientFailures = failureAnalysis.find(
				(f) => f.type === 'TICKET_INSUFFICIENT',
			);
			if (ticketInsufficientFailures && ticketInsufficientFailures.percentage > 40) {
				recommendations.push({
					type: 'immediate',
					priority: 'high',
					action: t('hooks.재매칭권_부족_상태에서의_시도_제한_또는_자동_구매_안'),
					expectedImprovement: '티켓 관련 실패 90% 감소',
				});
			}

			const communicationFailures = failureAnalysis.find(
				(f) => f.type === 'COMMUNICATION_RESTRICTED',
			);
			if (communicationFailures && communicationFailures.percentage > 20) {
				recommendations.push({
					type: 'short_term',
					priority: 'medium',
					action: t('hooks.소통_제한_상태_사용자_필터링_및_상태_표시_개선'),
					expectedImprovement: '제한 관련 실패 80% 감소',
				});
			}

			return recommendations;
		},
		[],
	);

	// 성과 지표 계산
	const getPerformanceMetrics = useCallback(() => {
		const efficiency = calculateSuccessRate(statistics.totalAttempts, statistics.successfulMatches);
		const stability =
			statistics.failureRate < 20 ? 'high' : statistics.failureRate < 40 ? 'medium' : 'low';

		return {
			overallEfficiency: efficiency,
			stability,
			userExperience:
				efficiency > 70 ? 'excellent' : efficiency > 50 ? 'good' : 'needs_improvement',
			recommendations: generateFailurePreventionRecommendations(
				analyzeFailureReasons(
					Object.entries(statistics.failureReasons).map(([type, count]) => ({ type, count })),
				),
				statistics,
			),
		};
	}, [
		statistics,
		calculateSuccessRate,
		analyzeFailureReasons,
		generateFailurePreventionRecommendations,
	]);

	return {
		statistics,
		trackMatchingAttempt,
		trackMatchingSuccess,
		trackMatchingFailure,
		calculateSuccessRate,
		analyzeFailureReasons,
		getPerformanceMetrics,
		generateFailurePreventionRecommendations,
	};
};

// 헬퍼 함수들
const getUserActionForFailure = (failureType: string): string => {
	const actionMap: Record<string, string> = {
		TICKET_INSUFFICIENT: i18n.t('hooks.재매칭권_구매_필요'),
		GEM_INSUFFICIENT: i18n.t('hooks.구슬_충전_필요'),
		COMMUNICATION_RESTRICTED: i18n.t('hooks.제한_시간_대기_필요'),
		DUPLICATE_LIKE: i18n.t('hooks.이미_처리된_요청'),
		INVALID_MATCH: i18n.t('hooks.새로운_매칭_시도_필요'),
		RATE_LIMIT: i18n.t('hooks.잠시_후_재시도_필요'),
		NETWORK_ERROR: i18n.t('hooks.네트워크_연결_확인_필요'),
	};
	return actionMap[failureType] || i18n.t('hooks.고객지원_문의_필요');
};

const isPreventableFailure = (failureType: string): boolean => {
	const preventableTypes = [
		'TICKET_INSUFFICIENT',
		'GEM_INSUFFICIENT',
		'RATE_LIMIT',
		'NETWORK_ERROR',
	];
	return preventableTypes.includes(failureType);
};
