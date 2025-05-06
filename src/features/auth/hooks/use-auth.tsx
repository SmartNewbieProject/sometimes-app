import { axiosClient, tryCatch } from "@/src/shared/libs";
import { useStorage } from "@shared/hooks/use-storage";
import { useMyDetailsQuery, useProfileDetailsQuery } from "../queries";
import { TokenResponse } from "@/src/types/auth";
import { useModal } from "@hooks/use-modal";
import { router } from "expo-router";
import { eventBus } from '@/src/shared/libs/event-bus';
import { useEffect } from 'react';

export function useAuth() {
  const { value: accessToken, setValue: setToken } = useStorage<string | null>({
    key: 'access-token',
    initialValue: null,
  });

  const { value: refreshToken, setValue: setRefreshToken } = useStorage<string | null>({
    key: 'refresh-token',
    initialValue: null,
  });

  const { data: profileDetails } = useProfileDetailsQuery(accessToken ?? null);
  const { my, ...myQueryProps } = useMyDetailsQuery(!!accessToken);
  const { showModal } = useModal();

  const login = async (email: string, password: string) => {
    const { accessToken, refreshToken } = await loginApi(email, password);

    await setToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  const logout = () => {
    tryCatch(async () => {
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
    }, error => {
      console.error(error);
      router.push('/auth/login');
    });
  };

  useEffect(() => {
    const unsubscribeTokens = eventBus.on('auth:tokensUpdated',
      async ({ accessToken, refreshToken }) => {
        await setToken(accessToken);
        await setRefreshToken(refreshToken);
      });

    const unsubscribeLogout = eventBus.on('auth:logout', async () => {
      await setToken(null);
      await setRefreshToken(null);
    });

    return () => {
      unsubscribeTokens();
      unsubscribeLogout();
    };
  }, [setToken, setRefreshToken]);

  return {
    login,
    profileDetails,
    isAuthorized: !!accessToken,
    logout,
    my,
    queryProps: {
      my: myQueryProps,
    },
  };
}

const loginApi = (email: string, password: string) =>
  axiosClient.post('/auth/login', {
    email, password,
  }) as unknown as Promise<TokenResponse>;

const logoutApi = (refreshToken: string) => axiosClient.post('/auth/logout', {
  refreshToken,
});
