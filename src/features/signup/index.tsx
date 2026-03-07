import apis from './apis';
import * as hooks from './hooks';
import * as lib from './lib/index';
import * as queries from './queries';
import { accountSchema, phoneSchema, profileSchema } from './services/schema';
import { LoginForm, LoginFormButtons, LoginFormContent, Logo } from './ui';
const Signup = {
	Logo,
	LoginForm,
	LoginFormContent,
	LoginFormButtons,
	schemas: {
		account: accountSchema,
		phone: phoneSchema,
		profile: profileSchema,
	},
	...hooks,
	apis,
	lib,
	queries,
};

export default Signup;
