import * as hook from './hooks';
import { doAdmin, loginProduction } from './services';

export const Admin = {
	services: {
		loginProduction,
		doAdmin,
	},
	hook,
};
