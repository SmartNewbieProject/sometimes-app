import apis from "./apis";
import useSignupProgress, { SignupSteps, type SignupForm } from "./hooks/use-signup-progress";
import useChangePhase from "./hooks/use-change-phase";
import { useSignupAnalytics } from "./hooks/use-signup-analytics";
import useWindowWidth from "./hooks/use-window-width";
import * as area from "./lib/area";
import * as university from "./lib/university";
import * as queries from "./queries";
import { accountSchema, phoneSchema, profileSchema } from "./services/schema";
import LoginForm from "./ui/login-form";
import Logo from "./ui/logo";
const Signup = {
  Logo,
  LoginForm,
  useSignupProgress,
  SignupSteps,
  useChangePhase,
  useSignupAnalytics,
  useWindowWidth,
  schemas: {
    account: accountSchema,
    phone: phoneSchema,
    profile: profileSchema,
  },
  apis,
  area,
  university,
  queries,
};

export type { SignupForm };

export default Signup;
