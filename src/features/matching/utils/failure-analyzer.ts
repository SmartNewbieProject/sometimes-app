/**
 * 매칭 실패 원인 분석 유틸리티
 * 서버 응답 메시지 기반 정확한 실패 원인 판단
 */

import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useTranslation } from 'react-i18next';

export interface FailureReason {
  type: string;
  category: 'PAYMENT' | 'PERMISSION' | 'USAGE' | 'SYSTEM';
  userAction: string;
  recoverable: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  serverMessage: string;
  httpStatus?: number;
  retryAvailableAt?: string;
  waitTimeSeconds?: number;
}

export interface FailureContext {
  currentGemBalance: number;
  ticketCount: number;
  recentLikeCount: number;
  recentMatchCount: number;
  restrictionHistory: {
    timestamp: number;
    endTime: number;
    type: string;
  }[];
  lastLikeTime: number;
  timeOfDay: number;
  isPeakTime: boolean;
}

const calculateWaitTimeSeconds = (retryAvailableAt: string | undefined): number | undefined => {
  if (!retryAvailableAt) return undefined;
  const retryTime = new Date(retryAvailableAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((retryTime - now) / 1000));
};

/**
 * 서버 응답 메시지 기반 실패 원인 분류
 */
export const determineFailureReason = (error: any): FailureReason => {
  const status = error.status;
  const responseData = error.response?.data || error;
  const message = responseData?.message || responseData?.error || error.message || '';
  const retryAvailableAt = responseData?.retry_available_at;

  // 403: 금지된 요청
  if (status === 403) {
    if (message.includes("재매칭권이_없습니다") || message.includes("티켓이_없습니다")) {
      return {
        type: 'TICKET_INSUFFICIENT',
        category: 'PAYMENT',
        userAction: 'PURCHASE_TICKET',
        recoverable: true,
        severity: 'MEDIUM',
        serverMessage: message,
        httpStatus: status
      };
    }

    if (message.includes("유효하지_않은_매칭") || message.includes("유효하지_않습니다")) {
      return {
        type: 'INVALID_MATCH',
        category: 'PERMISSION',
        userAction: 'CHECK_MATCH_STATUS',
        recoverable: false,
        severity: 'HIGH',
        serverMessage: message,
        httpStatus: status
      };
    }

    return {
      type: 'FORBIDDEN',
      category: 'PERMISSION',
      userAction: 'CONTACT_SUPPORT',
      recoverable: false,
      severity: 'HIGH',
      serverMessage: message,
      httpStatus: status
    };
  }

  // 409: 충돌 (중복 요청, 제한 사항)
  if (status === 409) {
    if (message.includes("소통이_제한") || message.includes("제한되어_있습니다")) {
      return {
        type: 'COMMUNICATION_RESTRICTED',
        category: 'USAGE',
        userAction: 'WAIT_RESTRICTION_PERIOD',
        recoverable: true,
        severity: 'MEDIUM',
        serverMessage: message,
        httpStatus: status,
        retryAvailableAt,
        waitTimeSeconds: calculateWaitTimeSeconds(retryAvailableAt)
      };
    }

    if (message.includes("이미_좋아요를_보냈습니다") || message.includes("이미_처리")) {
      return {
        type: 'DUPLICATE_LIKE',
        category: 'USAGE',
        userAction: 'ALREADY_PROCESSED',
        recoverable: true,
        severity: 'LOW',
        serverMessage: message,
        httpStatus: status
      };
    }

    return {
      type: 'CONFLICT',
      category: 'USAGE',
      userAction: 'RETRY_LATER',
      recoverable: true,
      severity: 'MEDIUM',
      serverMessage: message,
      httpStatus: status
    };
  }

  // 400: 잘못된 요청
  if (status === 400) {
    if (message.includes("상대방이_좋아요를_하지_않았습니다")) {
      return {
        type: 'MUTUAL_LIKE_REQUIRED',
        category: 'USAGE',
        userAction: 'WAIT_FOR_LIKE',
        recoverable: false,
        severity: 'MEDIUM',
        serverMessage: message,
        httpStatus: status
      };
    }

    if (message.includes("잘못된_버전") || message.includes("버전")) {
      return {
        type: 'APP_VERSION_MISMATCH',
        category: 'SYSTEM',
        userAction: 'UPDATE_APP',
        recoverable: true,
        severity: 'HIGH',
        serverMessage: message,
        httpStatus: status
      };
    }

    return {
      type: 'BAD_REQUEST',
      category: 'SYSTEM',
      userAction: 'CHECK_INPUT',
      recoverable: true,
      severity: 'MEDIUM',
      serverMessage: message,
      httpStatus: status
    };
  }

  // 404: 리소스를 찾을 수 없음
  if (status === 404) {
    if (message.includes("매칭_연결을_찾을_수_없습니다") || message.includes("매칭을_찾을_수_없습니다")) {
      return {
        type: 'MATCH_NOT_FOUND',
        category: 'SYSTEM',
        userAction: 'TRY_NEW_MATCH',
        recoverable: true,
        severity: 'HIGH',
        serverMessage: message,
        httpStatus: status
      };
    }

    if (message.includes("대상_사용자를_찾을_수_없습니다") || message.includes("사용자를_찾을_수_없습니다")) {
      return {
        type: 'USER_NOT_FOUND',
        category: 'SYSTEM',
        userAction: 'SEARCH_AGAIN',
        recoverable: true,
        severity: 'HIGH',
        serverMessage: message,
        httpStatus: status
      };
    }

    if (message.includes('인스타그램 ID를 찾을 수 없습니다')) {
      return {
        type: 'INSTAGRAM_NOT_AVAILABLE',
        category: 'PERMISSION',
        userAction: 'CHECK_MUTUAL_LIKE',
        recoverable: true,
        severity: 'MEDIUM',
        serverMessage: message,
        httpStatus: status
      };
    }

    return {
      type: 'NOT_FOUND',
      category: 'SYSTEM',
      userAction: 'RETRY_LATER',
      recoverable: true,
      severity: 'HIGH',
      serverMessage: message,
      httpStatus: status
    };
  }

  // 기타 에러
  return {
    type: 'UNKNOWN_ERROR',
    category: 'SYSTEM',
    userAction: 'RETRY_LATER',
    recoverable: true,
    severity: 'HIGH',
    serverMessage: message,
    httpStatus: status
  };
};

/**
 * 실패 가능성 미리 예측
 */
export const predictFailureLikelihood = (context: FailureContext) => {
  const { t } = useTranslation();

  let failureRisk = 0;
  let primaryRisk = '';
  let preventable = false;

  // 재매칭권 부족 리스크
  if (context.ticketCount === 0) {
    failureRisk += 45;
    primaryRisk = 'TICKET_INSUFFICIENT';
    preventable = true;
  }

  // 구슬 부족 리스크
  if (context.currentGemBalance < 50) {
    failureRisk += 30;
    if (!primaryRisk) primaryRisk = 'GEM_INSUFFICIENT';
    preventable = true;
  }

  // 최근 소통 제한 이력 리스크
  if (context.restrictionHistory.length > 0) {
    const lastRestriction = context.restrictionHistory[0];
    const hoursSinceRestriction = (Date.now() - lastRestriction.timestamp) / (1000 * 60 * 60);

    if (hoursSinceRestriction < 24) {
      failureRisk += 35;
      primaryRisk = 'COMMUNICATION_RESTRICTED';
    }
  }

  // 과도 사용 리스크
  if (context.recentLikeCount > 15) {
    failureRisk += 25;
    if (!primaryRisk) primaryRisk = 'RATE_LIMIT';
  }

  // 피크타임 리스크
  if (context.isPeakTime && context.recentLikeCount > 10) {
    failureRisk += 15;
    if (!primaryRisk) primaryRisk = 'PEAK_TIME_PRESSURE';
  }

  return {
    riskScore: failureRisk,
    primaryRisk,
    isHighRisk: failureRisk > 50,
    preventable,
    recommendations: getFailurePreventionActions(primaryRisk, context),
    predictedServerMessage: getPredictedServerMessage(primaryRisk)
  };
};

/**
 * 예상되는 서버 메시지 키 반환 (i18n)
 */
const getPredictedServerMessage = (riskType: string) => {
  const messageKeyMap: Record<string, string> = {
    'TICKET_INSUFFICIENT': 'features.matching.errors.server_messages.ticket_insufficient',
    'GEM_INSUFFICIENT': 'features.matching.errors.server_messages.gem_insufficient',
    'COMMUNICATION_RESTRICTED': 'features.matching.errors.server_messages.communication_restricted',
    'RATE_LIMIT': 'features.matching.errors.server_messages.rate_limit',
    'NETWORK_ERROR': 'features.matching.errors.server_messages.network_error',
    'APP_VERSION_MISMATCH': 'features.matching.errors.server_messages.version_mismatch_alt',
    'PEAK_TIME_PRESSURE': 'features.matching.errors.server_messages.peak_time'
  };

  return messageKeyMap[riskType] || 'features.matching.errors.server_messages.unknown_error';
};

/**
 * 실패 방지 조치 제안 (i18n 키 반환)
 */
const getFailurePreventionActions = (riskType: string, _context: FailureContext) => {
  const actions: Record<string, { action: string; messageKey: string; buttonKey: string; priority: string }> = {
    'TICKET_INSUFFICIENT': {
      action: 'SHOW_TICKET_PURCHASE_MODAL',
      messageKey: 'features.matching.errors.prevention_actions.ticket_insufficient.message',
      buttonKey: 'features.matching.errors.prevention_actions.ticket_insufficient.button',
      priority: 'HIGH'
    },
    'GEM_INSUFFICIENT': {
      action: 'SHOW_GEM_PURCHASE_MODAL',
      messageKey: 'features.matching.errors.prevention_actions.gem_insufficient.message',
      buttonKey: 'features.matching.errors.prevention_actions.gem_insufficient.button',
      priority: 'HIGH'
    },
    'COMMUNICATION_RESTRICTED': {
      action: 'SHOW_RESTRICTION_INFO',
      messageKey: 'features.matching.errors.prevention_actions.communication_restricted.message',
      buttonKey: 'features.matching.errors.prevention_actions.communication_restricted.button',
      priority: 'MEDIUM'
    },
    'RATE_LIMIT': {
      action: 'SHOW_COOLDOWN_INFO',
      messageKey: 'features.matching.errors.prevention_actions.rate_limit.message',
      buttonKey: 'features.matching.errors.prevention_actions.rate_limit.button',
      priority: 'LOW'
    },
    'PEAK_TIME_PRESSURE': {
      action: 'SHOW_PEAK_TIME_WARNING',
      messageKey: 'features.matching.errors.prevention_actions.peak_time.message',
      buttonKey: 'features.matching.errors.prevention_actions.peak_time.button',
      priority: 'LOW'
    }
  };

  return actions[riskType] || {
    action: 'SHOW_RETRY_MODAL',
    messageKey: 'features.matching.errors.prevention_actions.default.message',
    buttonKey: 'features.matching.errors.prevention_actions.default.button',
    priority: 'MEDIUM'
  };
};

// 헬퍼 함수
// 이미 선언된 함수들이므로 별도 export 필요 없음