import { axiosClient } from "@/src/shared/libs";
import type { PaymentBeforeHistory, PortOnePayment } from "../types";


export type CurrentGem = {
  totalGem: number;
};

export type GemDetails = {
  id: string;
  productName: string;
  gemAmount: number;
  bonusGems: number;
  totalGems: number;
  price: number;
  discountRate: number;
  sortOrder: number;
};

export type GemDetailsResponse = GemDetails[];

const savePaymentHistory = async (paymentHistory: PaymentBeforeHistory) =>
  axiosClient.post('/payments/history', paymentHistory);

const pay = (paymentDetails: PortOnePayment) =>
  axiosClient.post('/payments/confirm', paymentDetails);

const getCurrentGem = () => axiosClient.get('/v1/gem/current') as Promise<CurrentGem>;

const getAllGemProducts = () => axiosClient.get('/v1/gem/products') as Promise<GemDetailsResponse>;

const paymentApis = {
  saveHistory: savePaymentHistory,
  pay,
  getCurrentGem,
  getAllGemProducts,
};

export default paymentApis;
