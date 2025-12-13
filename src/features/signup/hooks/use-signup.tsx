import useSignupProgress from "./use-signup-progress";

export const useSignup = () => {
  const { signupResponse, setSignupResponse } = useSignupProgress();

  return {
    signupResponse,
    setSignupResponse,
  };
};
