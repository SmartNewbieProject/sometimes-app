import { axiosClient } from "@/src/shared/libs";
import type { PaymentBeforeHistory, PortOnePayment } from "../types";

export enum GemReferenceType {
  PAYMENT = 'PAYMENT',
  PROFILE_OPEN = 'PROFILE_OPEN',
  LIKE_MESSAGE = 'LIKE_MESSAGE',
  CHAT_START = 'CHAT_START',
  REMATCHING = 'REMATCHING',
  PREMIUM_FILTER = 'PREMIUM_FILTER',
  OLD_REMATCHING = 'OLD_REMATCHING', // 사라질 녀석임
}

export type ConsumableGemFeature =
    | GemReferenceType.PROFILE_OPEN
    | GemReferenceType.LIKE_MESSAGE
    | GemReferenceType.CHAT_START
    | GemReferenceType.REMATCHING
    | GemReferenceType.OLD_REMATCHING;

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

const payGem = (paymentDetails: PortOnePayment) =>
    axiosClient.post('/v1/gem/confirm', paymentDetails);

const getCurrentGem = () => axiosClient.get('/v1/gem/current') as Promise<CurrentGem>;

const getAllGemProducts = () => axiosClient.get('/v1/gem/products') as Promise<GemDetailsResponse>;

const getFeatureCosts = () => axiosClient.get('/v1/gem/features/cost') as Promise<Record<ConsumableGemFeature, number>>;

const paymentApis = {
  saveHistory: savePaymentHistory,
  pay,
  getCurrentGem,
  getAllGemProducts,
  payGem,
  getFeatureCosts
};

export default paymentApis;
