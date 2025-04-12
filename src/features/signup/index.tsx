import { Logo, LoginForm } from "./ui";
import * as hooks from "./hooks";
import { accountSchema } from "./services/schema";

const Signup = {
  Logo, 
  LoginForm,
  schemas: {
    account: accountSchema,
  },
  ...hooks,
};

export default Signup;
 