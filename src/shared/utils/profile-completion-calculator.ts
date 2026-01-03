/**
 * 프로필 완성도 계산기
 * Sometimes 앱 프로필 완성도 측정을 위한 핵심 모듈
 */

import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';

export interface UserProfile {
  profileImages: {
    id: string;
    order: number;
    isMain: boolean;
    url: string;
  }[];

  // 내 성향 정보 (characteristics)
  characteristics?: {
    typeName: string;
    selectedOptions: {
      id: string;
      displayName: string;
      imageUrl: string | null;
    }[];
  }[];

  // 내 이상형 정보 (preferences)
  preferences?: {
    typeName: string;
    selectedOptions: {
      id: string;
      displayName: string;
      imageUrl: string | null;
    }[];
  }[];
}

export class ProfileCompletionCalculator {
  private static readonly WEIGHTS: Record<string, number> = {
    // 프로필 이미지 (40점)
    profileImages: 40,

    // 내 성향 (35점)
    characteristics: 35,

    // 내 이상형 (25점)
    preferences: 25
  };

  static calculateScore(profile: UserProfile): number {
    let totalScore = 0;
    const completedFields: string[] = [];
    const incompleteFields: string[] = [];

    // 1. 프로필 이미지 점수 (40점)
    if (profile.profileImages && profile.profileImages.length > 0) {
      totalScore += 40;
      completedFields.push('profileImages');
    } else {
      incompleteFields.push('profileImages');
    }

    // 2. 내 성향 점수 (35점)
    if (profile.characteristics && profile.characteristics.length > 0) {
      totalScore += 35;
      completedFields.push('characteristics');
    } else {
      incompleteFields.push('characteristics');
    }

    // 3. 내 이상형 점수 (25점)
    if (profile.preferences && profile.preferences.length > 0) {
      totalScore += 25;
      completedFields.push('preferences');
    } else {
      incompleteFields.push('preferences');
    }

    // 프로필 완성 여부 확인
    const isProfileComplete = this.isProfileComplete(profile);

    // 이벤트 트래킹 (Mixpanel)
    this.trackCompletionUpdate(totalScore, completedFields, incompleteFields, isProfileComplete);

    return totalScore;
  }

  // 프로필 완성 여부 확인 (단순화)
  static isProfileComplete(profile: UserProfile): boolean {
    const hasImages = profile.profileImages && profile.profileImages.length > 0;
    const hasCharacteristics = profile.characteristics && profile.characteristics.length > 0;
    const hasPreferences = profile.preferences && profile.preferences.length > 0;

    return Boolean(hasImages && hasCharacteristics && hasPreferences);
  }

  
  private static trackCompletionUpdate(
    score: number,
    completedFields: string[],
    incompleteFields: string[],
    isProfileComplete: boolean
  ): void {
    // Mixpanel 이벤트 상수 사용

    mixpanelAdapter.track(MIXPANEL_EVENTS.PROFILE_COMPLETION_UPDATED, {
      completion_score: score,
      completion_level: this.getCompletionLevel(score),
      completed_fields_count: completedFields.length,
      incomplete_fields_count: incompleteFields.length,
      completed_fields: completedFields,
      incomplete_fields: incompleteFields,
      score_percentage: Math.round(score),
      is_profile_complete: isProfileComplete
    });

    // 프로필 완성 시 특별 이벤트
    if (isProfileComplete) {
      mixpanelAdapter.track('PROFILE_COMPLETED', {
        completion_score: score,
        completion_time: new Date().toISOString()
      });
    }
  }

  static getCompletionLevel(score: number): string {
    if (score < 30) return 'incomplete';
    if (score < 60) return 'basic';
    if (score < 80) return 'standard';
    if (score < 95) return 'excellent';
    return 'complete';
  }

  }