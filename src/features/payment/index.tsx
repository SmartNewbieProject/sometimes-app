import { nanoid } from 'nanoid';
import paymentApis from './api';
import * as types from './types';
import * as ui from './ui';
import webPayment from './web';

const createUniqueId = () =>
  nanoid()
    .replaceAll(/-/g, '')
    .replaceAll(/_/g, '');


const Payment = {
  ui,
  apis: paymentApis,
  types,
  services: {
    createUniqueId,
  },
  web: webPayment,
};

export default Payment;
