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
}

export interface PaymentRequestCustomer {
  fullName?: string;
  customerId?: string;
  phoneNumber?: string;
  email?: string;
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


export interface PaymentRequest {
storeId: string;
channelKey?: string;
paymentId: string;
orderName: string;
totalAmount: number;
currency: Currency;
payMethod: 'CARD';
customer?: PaymentRequestCustomer;
customData?: Record<string, unknown>;
// 기타 필요한 필드 확장 가능
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
