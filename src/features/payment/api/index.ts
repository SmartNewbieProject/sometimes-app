import { axiosClient } from '@/src/shared/libs';
import type { PaymentBeforeHistory, PortOnePayment } from '../types';

const savePaymentHistory = async (paymentHistory: PaymentBeforeHistory) =>
	axiosClient.post('/payments/history', paymentHistory);

const pay = (paymentDetails: PortOnePayment) =>
	axiosClient.post('/payments/confirm', paymentDetails);

const paymentApis = {
	saveHistory: savePaymentHistory,
	pay,
};

export default paymentApis;
