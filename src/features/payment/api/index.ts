import { axiosClient } from "@/src/shared/libs";
import { PaymentBeforeHistory, PaymentDetails } from "../types";


const savePaymentHistory = async (paymentHistory: PaymentBeforeHistory) =>
  axiosClient.post('/payments/history', paymentHistory);

const pay = (paymentDetails: PaymentDetails) =>
  axiosClient.post('/payments/confirm', paymentDetails);

const paymentApis = {
  saveHistory: savePaymentHistory,
  pay,
};

export default paymentApis;
