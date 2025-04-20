import { axiosClient } from "@/src/shared/libs";
import { useStorage } from "@shared/hooks/use-storage";
import { useProfileDetailsQuery } from "../queries";
import { TokenResponse } from "@/src/types/auth";
import { useModal } from "@hooks/use-modal";
import { router } from "expo-router";

export function useAuth() {
  const { value: accessToken, setValue: setToken } = useStorage<string | null>({
    key: 'access-token',
    initialValue: null,
  });

  const { value: refreshToken, setValue: setRefreshToken } = useStorage<string | null>({
    key: 'refresh-token',
    initialValue: null,
  });
  const { data: profileDetails } = useProfileDetailsQuery(!!accessToken);
  const { showModal } = useModal();

  const login = async (email: string, password: string) => {
    const { accessToken, refreshToken } = await loginApi(email, password);
    
    await setToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  const logout = async () => {
    if (!refreshToken) {
      router.push('/auth/login');
      await setToken(null);
      await setRefreshToken(null);
      return;
    }
    await logoutApi(refreshToken);
    await setToken(null);
    showModal({
      title: '로그아웃',
      children: '로그아웃 되었습니다.',
      primaryButton: {
        text: '확인',
        onClick: () => router.push('/auth/login'),
      },
    });
  };

  return {
    login,
    profileDetails,
    isAuthorized: !!accessToken,
    logout,
  };
}

const loginApi = (email: string, password: string) =>
  axiosClient.post('/auth/login', {
    email, password,
  }) as unknown as Promise<TokenResponse>;

const logoutApi = (refreshToken: string) => axiosClient.post('/auth/logout', {
  refreshToken,
});
