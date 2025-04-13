import { axiosClient } from "@/src/shared/libs";
import { useStorage } from "@shared/hooks/use-storage";
import { useProfileDetailsQuery } from "../queries";
import { TokenResponse } from "@/src/types/auth";

const loginApi = (email: string, password: string) => {
  return axiosClient.post('/auth/login', {
    email, password,
  }) as unknown as TokenResponse;
}

export function useAuth() {
  const { value: accessToken, setValue: setToken } = useStorage<string | null>({
    key: 'access-token',
    initialValue: null,
  });
  const { data: profileDeatails } = useProfileDetailsQuery(!!accessToken);

  const login = async (email: string, password: string) => {
    const { accessToken } = await loginApi(email, password);
    setToken(accessToken);
  };

  return {
    login,
    profileDeatails,
    isAuthorized: !!accessToken,
  };
}
