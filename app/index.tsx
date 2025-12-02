import Loading from "@/src/features/loading";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import "react-native-get-random-values";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { useStorage } from "@/src/shared/hooks/use-storage";
import i18n from '@/src/shared/libs/i18n';

export default function Home() {
  const { isAuthorized } = useAuth();
  const redirectPath = "/home";
  const loginPath = "/auth/login";
  const { "invite-code": inviteCode } = useLocalSearchParams<{ "invite-code"?: string }>();
  const { setValue} = useStorage({key: "invite-code"})


    useEffect(() => {
      console.log("inviteCode", inviteCode)
      if (inviteCode) {
        setValue(inviteCode)
      }
    },[inviteCode])
    

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthorized) {
        router.push(redirectPath);
      } else {
        router.push(loginPath);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthorized, redirectPath]);

  return <Loading.Page title={i18n.t("apps.index.loading")} />;
}
