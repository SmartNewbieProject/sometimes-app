/**
 * 프로필 완성도 상태 관리 훅
 * 사용자 프로필 완성도를 실시간으로 계산하고 Mixpanel 이벤트 트래킹
 */

import { useState, useEffect, useCallback } from 'react';
import { UserProfile , ProfileCompletionCalculator } from '@/src/shared/utils/profile-completion-calculator';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';

export const useProfileCompletion = (profile: UserProfile) => {
  const [completionScore, setCompletionScore] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // 프로필 변경될 때마다 완성도 점수 재계산
  useEffect(() => {
    const newScore = ProfileCompletionCalculator.calculateScore(profile);
    const newIsComplete = ProfileCompletionCalculator.isProfileComplete(profile);

    setCompletionScore(newScore);
    setIsComplete(newIsComplete);
  }, [profile]);

  // 특정 필드 업데이트 트래킹
  const trackFieldUpdate = useCallback((fieldName: string, isCompleted: boolean) => {

    if (isCompleted) {
      mixpanelAdapter.track('PROFILE_FIELD_COMPLETED', {
        field_name: fieldName,
        completion_score: completionScore,
        field_progress: 'completed'
      });
    } else {
      mixpanelAdapter.track('PROFILE_FIELD_INCOMPLETE', {
        field_name: fieldName,
        completion_score: completionScore,
        field_progress: 'incomplete'
      });
    }
  }, [completionScore]);

  // 프로필 완성 상태 변경 감지
  const checkProfileCompletion = useCallback(() => {
    const isNowComplete = ProfileCompletionCalculator.isProfileComplete(profile);

    // 완성 상태가 변경된 경우
    if (!isComplete && isNowComplete) {

      mixpanelAdapter.track('PROFILE_COMPLETION_ACHIEVED', {
        completion_score: completionScore,
        completion_time: new Date().toISOString(),
        total_sections: 3,
        completed_sections: 3
      });

      setIsComplete(true);
      return true; // 완성됨
    }

    return false; // 변화 없음
  }, [completionScore, profile, isComplete]);

  return {
    completionScore,
    isComplete,
    trackFieldUpdate,
    checkProfileCompletion
  };
};