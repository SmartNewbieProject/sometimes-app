import apis from "./apis";
import * as hooks from "./hooks";
import * as queries from "./queries";
import { accountSchema, phoneSchema, profileSchema } from "./services/schema";
import { LoginForm, Logo } from "./ui";

const Signup = {
  Logo,
  LoginForm,
  schemas: {
    account: accountSchema,
    phone: phoneSchema,
    profile: profileSchema,
  },
  ...hooks,
  apis,
  queries,
};

export default Signup;
