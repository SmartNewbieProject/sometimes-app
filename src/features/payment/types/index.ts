import { GemDetails } from "../api";
import { useTranslation } from 'react-i18next';
import { EventType } from "@/src/features/event/types";

export type PaymentBeforeHistory = {
  orderId: string;
  amount: number;
  orderName: string;
}

/**
 * @deprecated 이전결제사 연동정보
 */
export type PaymentDetails = {
  orderId: string;
  txId: string;
};

export type PortOnePayment = {
  txId: string;
  merchantUid: string;
  eventType?: EventType;
}

export enum Product {
  REMATCHING = "연인_재매칭권",
}

export type PaymentSuccessStates = {
  orderName: string;
  amount: string;
  imp_uid: string;
  merchant_uid: string;
  productType: Product;
};


export interface CustomData {
  orderName: string;
  amount: number;
  productType: Product;
  productCount: number;
  gemCount?: number;
}

export type Currency =
  | 'CURRENCY_KRW'
  | 'CURRENCY_USD'
  | 'CURRENCY_EUR'
  | 'CURRENCY_JPY'
  | 'CURRENCY_CNY'
  | 'CURRENCY_VND'
  | 'CURRENCY_THB'
  | 'CURRENCY_SGD'
  | 'CURRENCY_AUD'
  | 'CURRENCY_HKD';

export type PayMethod =
  | 'CARD'
  | 'VIRTUAL_ACCOUNT'
  | 'TRANSFER'
  | 'MOBILE'
  | 'GIFT_CERTIFICATE'
  | 'EASY_PAY'
  | 'PAYPAL'
  | 'ALIPAY'
  | 'CONVENIENCE_STORE';

export type WelcomePaymentBypass = Record<string, unknown>;

export interface PaymentAcceptMethodOption {
  SKIN?: string; // 예: 'SKIN(#fc6b2d)'
  below1000?: boolean;
  onlyeasypaycode?: string; // 예: 'kakaopay:lpay:payco'
  SLIMQUOTA?: string; // 예: 'SLIMQUOTA(11-2:3^34-2:3)'
  paypopup?: boolean;
  hppdefaultcorp?: 'SKT' | 'KTF' | 'LGT' | 'MVNO' | 'CJH' | 'KCT' | 'SKL';
  hppnofix?: 'Y' | 'N';
  va_ckprice?: boolean;
  // 기타 옵션이 있을 수 있으니 string[]로도 허용
  [key: string]: unknown;
}


export interface PaymentRequestCustomer {
  customerId?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  address?: {
    country?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    province?: string;
    zipcode?: string;
  }
  gender?: string;
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
  firstNameKana?: string;
  lastNameKana?: string;
}

export interface PaymentRequest {
  storeId: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: Currency;
  payMethod: PayMethod;
  channelKey?: string;
  channelGroupId?: string;
  taxFreeAmount?: number;
  vatAmount?: number;
  customer?: PaymentRequestCustomer;
  windowType?: string;
  redirectUrl?: string;
  noticeUrls?: string[];
  confirmUrl?: string;
  appScheme?: string;
  isEscrow?: boolean;
  products?: Record<string, unknown>[];
  isCulturalExpense?: boolean;
  locale?: string;
  customData?: Record<string, unknown>;
  offerPeriod?: Record<string, unknown>;
  productType?: string;
  storeDetails?: Record<string, unknown>;
  bypass?: Record<string, unknown>;
  country?: string;
  shippingAddress?: Record<string, unknown>;
  promotionId?: string;
  popup?: Record<string, unknown>;
  card?: Record<string, unknown>;
  virtualAccount?: Record<string, unknown>;
  transfer?: Record<string, unknown>;
  mobile?: Record<string, unknown>;
  giftCertificate?: Record<string, unknown>;
  easyPay?: Record<string, unknown>;
  paypal?: Record<string, unknown>;
  alipay?: Record<string, unknown>;
  convenienceStore?: Record<string, unknown>;
  welcome?: WelcomePaymentBypass;
}

// 관련 문서 -  https://developers.portone.io/sdk/ko/v2-sdk/payment-response?v=v2
export interface PaymentResponse {
  txId: string;
  paymentId: string;
  transactionType: 'PAYMENT';
  code?: string;
  message?: string;
  pgCode?: string;
  pgMessage?: string;
  pgProvider?: string;
  amount?: number;
  totalAmount?: number;
  method?: string;
  products?: unknown[];
}

export type GemMetadata = {
  totalPrice: number;
  gemProduct: GemDetails;
  eventType?: EventType;
}

export interface UserMetrics {
  userId: string;
  metrics: {
    totalSpent: number;
    purchaseCount: number;
    firstPurchaseAt: string | null;
    lastPurchaseAt: string | null;
    accountCreatedAt: string;
    lastActiveAt: string;
    averagePurchaseValue: number;
    daysSinceFirstPurchase: number | null;
    isChurned: boolean;
  };
  calculatedLTV: number | null;
}

/**
 * 결제 오류 카테고리
 * 오류를 체계적으로 분류하여 Mixpanel 대시보드에서 분석 가능
 */
export type PaymentErrorCategoryType =
  | 'NETWORK'           // 네트워크 연결 오류
  | 'USER_CANCEL'       // 사용자가 의도적으로 취소
  | 'PG_ERROR'          // PG사 시스템 오류
  | 'CARD_LIMIT'        // 카드 한도 초과
  | 'AUTH_FAIL'         // 인증 실패 (OTP, 비밀번호 등)
  | 'INVALID_CARD'      // 유효하지 않은 카드
  | 'TIMEOUT'           // 타임아웃
  | 'INSUFFICIENT_BALANCE' // 잔액 부족
  | 'UNKNOWN';          // 알 수 없는 오류

export interface PaymentErrorCategory {
  category: PaymentErrorCategoryType;
  message: string;
  retryable: boolean;  // 재시도 가능 여부
  userMessage?: string; // 사용자에게 표시할 친화적 메시지
}

/**
 * 오류 메시지 패턴 기반 카테고리 분류 유틸리티
 */
export const categorizePaymentError = (errorMessage: string): PaymentErrorCategory => {
  const lowerMessage = errorMessage.toLowerCase();

  // 네트워크 오류
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes("연결") ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes("타임아웃")
  ) {
    return {
      category: lowerMessage.includes('timeout') || lowerMessage.includes("타임아웃")
        ? 'TIMEOUT'
        : 'NETWORK',
      message: errorMessage,
      retryable: true,
      userMessage: "네트워크_연결이_불안정합니다_다시_시도해주세요"
    };
  }

  // 사용자 취소
  if (
    lowerMessage.includes("취소") ||
    lowerMessage.includes('cancel') ||
    lowerMessage.includes("사용자")
  ) {
    return {
      category: 'USER_CANCEL',
      message: errorMessage,
      retryable: true,
      userMessage: "결제가_취소되었습니다"
    };
  }

  // 카드 한도
  if (
    lowerMessage.includes("한도") ||
    lowerMessage.includes('limit') ||
    lowerMessage.includes('exceed')
  ) {
    return {
      category: 'CARD_LIMIT',
      message: errorMessage,
      retryable: false,
      userMessage: "카드_한도를_초과했습니다_다른_결제_수단을_이용해주세"
    };
  }

  // 잔액 부족
  if (
    lowerMessage.includes("잔액") ||
    lowerMessage.includes('balance') ||
    lowerMessage.includes('insufficient')
  ) {
    return {
      category: 'INSUFFICIENT_BALANCE',
      message: errorMessage,
      retryable: false,
      userMessage: "잔액이_부족합니다_다른_결제_수단을_이용해주세요"
    };
  }

  // 인증 실패
  if (
    lowerMessage.includes("인증") ||
    lowerMessage.includes('auth') ||
    lowerMessage.includes('otp') ||
    lowerMessage.includes('password') ||
    lowerMessage.includes("비밀번호")
  ) {
    return {
      category: 'AUTH_FAIL',
      message: errorMessage,
      retryable: true,
      userMessage: "인증에_실패했습니다_다시_시도해주세요"
    };
  }

  // 유효하지 않은 카드
  if (
    lowerMessage.includes('invalid') ||
    lowerMessage.includes("유효하지") ||
    lowerMessage.includes("만료") ||
    lowerMessage.includes('expired')
  ) {
    return {
      category: 'INVALID_CARD',
      message: errorMessage,
      retryable: false,
      userMessage: "유효하지_않은_카드입니다_다른_카드를_이용해주세요"
    };
  }

  // PG 오류
  if (
    lowerMessage.includes('pg') ||
    lowerMessage.includes("시스템") ||
    lowerMessage.includes('system') ||
    lowerMessage.includes('server')
  ) {
    return {
      category: 'PG_ERROR',
      message: errorMessage,
      retryable: true,
      userMessage: "일시적인_오류입니다_잠시_후_다시_시도해주세요"
    };
  }

  // 기타 알 수 없는 오류
  return {
    category: 'UNKNOWN',
    message: errorMessage,
    retryable: true,
    userMessage: "결제_처리_중_오류가_발생했습니다_다시_시도해주세요"
  };
};
