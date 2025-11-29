import Loading from "@/src/features/loading";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import "react-native-get-random-values";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { useStorage } from "@/src/shared/hooks/use-storage";

export default function Home() {
  // 임시적으로 항상 false로 설정하여 로그인 페이지로 이동
  const redirectPath = "/home";
  const loginPath = "/auth/login";
  const { "invite-code": inviteCode } = useLocalSearchParams<{ "invite-code"?: string }>();
  const { setValue} = useStorage({key: "invite-code"});

    useEffect(() => {
      console.log("inviteCode", inviteCode)
      if (inviteCode) {
        setValue(inviteCode)
      }
    },[inviteCode])

  useEffect(() => {
    console.log("Home component loaded - redirecting to login");
    // 임시적으로 항상 false로 설정하여 로그인 페이지로 바로 이동
    setTimeout(() => {
      router.push(loginPath);
    }, 100);
  }, [loginPath]);

  return <Loading.Page title="앱을 불러오고 있어요!" />;
}
