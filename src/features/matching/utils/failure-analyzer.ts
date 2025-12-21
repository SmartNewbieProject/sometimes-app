/**
 * 매칭 실패 원인 분석 유틸리티
 * 서버 응답 메시지 기반 정확한 실패 원인 판단
 */

import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';

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
    if (message.includes('재매칭권이 없습니다') || message.includes('티켓이 없습니다')) {
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

    if (message.includes('유효하지 않은 매칭') || message.includes('유효하지 않습니다')) {
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
    if (message.includes('소통이 제한') || message.includes('제한되어 있습니다')) {
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

    if (message.includes('이미 좋아요를 보냈습니다') || message.includes('이미 처리')) {
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
    if (message.includes('상대방이 좋아요를 하지 않았습니다')) {
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

    if (message.includes('잘못된 버전') || message.includes('버전')) {
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
    if (message.includes('매칭 연결을 찾을 수 없습니다') || message.includes('매칭을 찾을 수 없습니다')) {
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

    if (message.includes('대상 사용자를 찾을 수 없습니다') || message.includes('사용자를 찾을 수 없습니다')) {
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
 * 예상되는 서버 메시지 반환
 */
const getPredictedServerMessage = (riskType: string) => {
  const messageMap = {
    'TICKET_INSUFFICIENT': '재매칭권이 없습니다',
    'GEM_INSUFFICIENT': '구슬이 부족합니다',
    'COMMUNICATION_RESTRICTED': '현재 상대방과 소통이 제한되어 있습니다',
    'RATE_LIMIT': '과도한 요청입니다',
    'NETWORK_ERROR': '네트워크 연결을 확인해주세요',
    'APP_VERSION_MISMATCH': '잘못된 버전입니다',
    'PEAK_TIME_PRESSURE': '현재 사용자가 많아 일시적으로 지연될 수 있습니다'
  };

  return messageMap[riskType] || '알 수 없는 오류가 발생했습니다';
};

/**
 * 실패 방지 조치 제안
 */
const getFailurePreventionActions = (riskType: string, context: FailureContext) => {
  const actions = {
    'TICKET_INSUFFICIENT': {
      action: 'SHOW_TICKET_PURCHASE_MODAL',
      message: '재매칭권이 필요합니다. 지금 구매하시겠어요?',
      button: '재매칭권 구매',
      priority: 'HIGH'
    },
    'GEM_INSUFFICIENT': {
      action: 'SHOW_GEM_PURCHASE_MODAL',
      message: '구슬이 부족합니다. 구슬을 충전하고 다시 시도해주세요.',
      button: '구슬 구매',
      priority: 'HIGH'
    },
    'COMMUNICATION_RESTRICTED': {
      action: 'SHOW_RESTRICTION_INFO',
      message: '소통 제한 시간입니다. 잠시 기다려주세요.',
      button: '제한 시간 확인',
      priority: 'MEDIUM'
    },
    'RATE_LIMIT': {
      action: 'SHOW_COOLDOWN_INFO',
      message: '요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.',
      button: '잠시 후 재시도',
      priority: 'LOW'
    },
    'PEAK_TIME_PRESSURE': {
      action: 'SHOW_PEAK_TIME_WARNING',
      message: '지금 사용자가 많아 지연될 수 있습니다.',
      button: '계속 진행',
      priority: 'LOW'
    }
  };

  return actions[riskType] || {
    action: 'SHOW_RETRY_MODAL',
    message: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    button: '재시도',
    priority: 'MEDIUM'
  };
};

// 헬퍼 함수
// 이미 선언된 함수들이므로 별도 export 필요 없음