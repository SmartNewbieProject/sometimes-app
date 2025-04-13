import apis from "./apis";
import * as hooks from "./hooks";
import * as queries from "./queries";
import { accountSchema } from "./services/schema";
import { LoginForm, Logo } from "./ui";

const Signup = {
  Logo, 
  LoginForm,
  schemas: {
    account: accountSchema,
  },
  ...hooks,
  apis,
  queries,
};

export default Signup;
