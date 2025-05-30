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
  impUid?: string;
  txId?: string;
  merchantUid: string;
}

export type PaymentRequest = {
  paymentId: string;
  totalAmount: number;
  orderName: string;  
  payMethod: 'CARD';
};

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
