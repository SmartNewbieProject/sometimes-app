import { doAdmin, loginProduction } from './services';
import * as hook from './hooks';

export const Admin = {
  services: {
    loginProduction,
    doAdmin,
  },
  hook,
};
