/**
 * 매칭 효율성 분석 훅
 * 실시간 매칭 성공률/실패율 통계 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';

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
      last30Days: 0
    },
    averageResponseTime: 0,
    peakHourPerformance: {}
  });

  // 실시간 성공률 계산
  const calculateSuccessRate = useCallback((
    totalAttempts: number,
    successfulMatches: number
  ): number => {
    if (totalAttempts === 0) return 0;
    return Math.round((successfulMatches / totalAttempts) * 100);
  }, []);

  // 실패 원인 분석
  const analyzeFailureReasons = useCallback((
    failureData: { type: string; count: number }[]
  ): FailureAnalysis[] => {
    const totalFailures = failureData.reduce((sum, item) => sum + item.count, 0);

    return failureData.map(item => ({
      type: item.type,
      count: item.count,
      percentage: totalFailures > 0 ? Math.round((item.count / totalFailures) * 100) : 0,
      trend: 'stable', // TODO: 히스토리 데이터 기반 트렌드 분석
      userActionRequired: getUserActionForFailure(item.type),
      preventable: isPreventableFailure(item.type)
    })).sort((a, b) => b.count - a.count);
  }, []);

  // 매칭 시도 이벤트 트래킹
  const trackMatchingAttempt = useCallback((
    connectionId: string,
    context: {
      gemBalance: number;
      timeOfDay: number;
      isPeakTime: boolean;
      userTier?: string;
    }
  ) => {
    mixpanelAdapter.track(MIXPANEL_EVENTS.MATCHING_REQUESTED, {
      action_type: 'like_requested',
      connection_id: connectionId,
      user_context: {
        gem_balance: context.gemBalance,
        time_of_day: context.timeOfDay,
        is_peak_time: context.isPeakTime,
        user_tier: context.userTier
      },
      timestamp: new Date().toISOString()
    });

    // 통계 업데이트
    setStatistics(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      successRate: calculateSuccessRate(prev.totalAttempts + 1, prev.successfulMatches),
      failureRate: calculateFailureRate(prev.totalAttempts + 1, prev.failedAttempts)
    }));
  }, [calculateSuccessRate]);

  // 매칭 성공 이벤트 트래킹
  const trackMatchingSuccess = useCallback((
    connectionId: string,
    context: {
      matchType: 'mutual_like' | 'instant_match';
      responseTime: number;
    }
  ) => {
    // KPI 이벤트: 매칭 성공 (User Properties 자동 업데이트 포함)
    matchingEvents.trackMatchingSuccess(connectionId, context.responseTime);

    // 통계 업데이트
    setStatistics(prev => {
      const newSuccessful = prev.successfulMatches + 1;
      return {
        ...prev,
        successfulMatches: newSuccessful,
        successRate: calculateSuccessRate(prev.totalAttempts, newSuccessful),
        averageResponseTime: (prev.averageResponseTime + context.responseTime) / 2
      };
    });
  }, [calculateSuccessRate, matchingEvents]);

  // 매칭 실패 이벤트 트래킹
  const trackMatchingFailure = useCallback((
    connectionId: string,
    failureReason: {
      type: string;
      category: string;
      userAction: string;
      recoverable: boolean;
      severity: string;
      serverMessage: string;
    }
  ) => {
    // KPI 이벤트: 매칭 실패
    matchingEvents.trackMatchingFailed(failureReason.serverMessage, {
      failureCategory: failureReason.category as any,
      isRecoverable: failureReason.recoverable,
    });

    // 통계 업데이트
    setStatistics(prev => {
      const newFailed = prev.failedAttempts + 1;
      const updatedFailureReasons = {
        ...prev.failureReasons,
        [failureReason.type]: (prev.failureReasons[failureReason.type] || 0) + 1
      };

      return {
        ...prev,
        failedAttempts: newFailed,
        failureReasons: updatedFailureReasons,
        failureRate: calculateFailureRate(prev.totalAttempts, newFailed)
      };
    });
  }, [matchingEvents]);

  // 실패율 계산
  const calculateFailureRate = useCallback((
    totalAttempts: number,
    failedAttempts: number
  ): number => {
    if (totalAttempts === 0) return 0;
    return Math.round((failedAttempts / totalAttempts) * 100);
  }, []);

  // 실패 방지 추천 생성
  const generateFailurePreventionRecommendations = useCallback((
    failureAnalysis: FailureAnalysis[],
    currentStatistics: MatchingStatistics
  ) => {
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
        action: '사용자 자산 상태 사전 확인 및 안내',
        expectedImprovement: '15-25% 실패율 감소'
      });
    }

    // 특정 실패 타입이 많은 경우
    const ticketInsufficientFailures = failureAnalysis.find(f => f.type === 'TICKET_INSUFFICIENT');
    if (ticketInsufficientFailures && ticketInsufficientFailures.percentage > 40) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: '재매칭권 부족 상태에서의 시도 제한 또는 자동 구매 안내',
        expectedImprovement: '티켓 관련 실패 90% 감소'
      });
    }

    const communicationFailures = failureAnalysis.find(f => f.type === 'COMMUNICATION_RESTRICTED');
    if (communicationFailures && communicationFailures.percentage > 20) {
      recommendations.push({
        type: 'short_term',
        priority: 'medium',
        action: '소통 제한 상태 사용자 필터링 및 상태 표시 개선',
        expectedImprovement: '제한 관련 실패 80% 감소'
      });
    }

    return recommendations;
  }, []);

  // 성과 지표 계산
  const getPerformanceMetrics = useCallback(() => {
    const efficiency = calculateSuccessRate(statistics.totalAttempts, statistics.successfulMatches);
    const stability = statistics.failureRate < 20 ? 'high' : statistics.failureRate < 40 ? 'medium' : 'low';

    return {
      overallEfficiency: efficiency,
      stability,
      userExperience: efficiency > 70 ? 'excellent' : efficiency > 50 ? 'good' : 'needs_improvement',
      recommendations: generateFailurePreventionRecommendations(
        analyzeFailureReasons(Object.entries(statistics.failureReasons).map(([type, count]) => ({ type, count }))),
        statistics
      )
    };
  }, [statistics, calculateSuccessRate, analyzeFailureReasons, generateFailurePreventionRecommendations]);

  return {
    statistics,
    trackMatchingAttempt,
    trackMatchingSuccess,
    trackMatchingFailure,
    calculateSuccessRate,
    analyzeFailureReasons,
    getPerformanceMetrics,
    generateFailurePreventionRecommendations
  };
};

// 헬퍼 함수들
const getUserActionForFailure = (failureType: string): string => {
  const actionMap: Record<string, string> = {
    'TICKET_INSUFFICIENT': '재매칭권 구매 필요',
    'GEM_INSUFFICIENT': '구슬 충전 필요',
    'COMMUNICATION_RESTRICTED': '제한 시간 대기 필요',
    'DUPLICATE_LIKE': '이미 처리된 요청',
    'INVALID_MATCH': '새로운 매칭 시도 필요',
    'RATE_LIMIT': '잠시 후 재시도 필요',
    'NETWORK_ERROR': '네트워크 연결 확인 필요'
  };
  return actionMap[failureType] || '고객지원 문의 필요';
};

const isPreventableFailure = (failureType: string): boolean => {
  const preventableTypes = [
    'TICKET_INSUFFICIENT',
    'GEM_INSUFFICIENT',
    'RATE_LIMIT',
    'NETWORK_ERROR'
  ];
  return preventableTypes.includes(failureType);
};