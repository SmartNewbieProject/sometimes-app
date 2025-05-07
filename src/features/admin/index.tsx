import { loginProduction } from './services';
import * as hook from './hooks';

export const Admin = {
  services: {
    loginProduction,
  },
  hook,
};
