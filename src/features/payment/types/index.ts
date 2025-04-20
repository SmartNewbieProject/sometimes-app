export type PaymentBeforeHistory = {
  orderId: string;
  amount: number;
  orderName: string;
}

export type PaymentDetails = {
  orderId: string;
  txId: string;
};

export type PaymentRequest = {
  paymentId: string;
  totalAmount: number;
  orderName: string;  
  payMethod: 'CARD';
};
