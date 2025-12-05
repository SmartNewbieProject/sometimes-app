import { GemDetails } from "../api";
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
  REMATCHING = '연인 재매칭권',
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
