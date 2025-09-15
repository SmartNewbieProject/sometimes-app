// app/index.tsx
import { useEffect, useState } from "react";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-get-random-values";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import Loading from "@/src/features/loading";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Home() {
  const { isAuthorized } = useAuth();
  const [booting, setBooting] = useState(true);

  const redirectPath = "/home";
  const loginPath = "/auth/login";

  useEffect(() => {
    let mounted = true;

    const go = async () => {
      // 약간의 지연으로 초기 훅/스토어가 안정화되도록(기존 100ms 유지)
      await new Promise((r) => setTimeout(r, 100));

      const target = isAuthorized ? redirectPath : loginPath;
      // replace로 히스토리 쌓임 방지
      router.replace(target);

      requestAnimationFrame(async () => {
        await SplashScreen.hideAsync().catch(() => {});
        if (mounted) setBooting(false);
      });
    };

    go();

    return () => {
      mounted = false;
    };
  }, [isAuthorized]);

  if (booting) return null;

  return <Loading.Page title="앱을 불러오고 있어요!" />;
}
