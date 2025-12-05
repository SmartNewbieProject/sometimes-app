import Loading from "@/src/features/loading";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import "react-native-get-random-values";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { useStorage } from "@/src/shared/hooks/use-storage";
import i18n from '@/src/shared/libs/i18n';
import { useRecordInviteClick } from "@/src/features/invite/hooks/use-record-invite-click";
import type { InviteReferrer } from "@/src/features/invite/types";

export default function Home() {
  const { isAuthorized } = useAuth();
  const redirectPath = "/home";
  const loginPath = "/auth/login";
  const { "invite-code": inviteCode, ref: referrer } = useLocalSearchParams<{
    "invite-code"?: string;
    ref?: string;
  }>();
  const { setValue } = useStorage({ key: "invite-code" });
  const { recordClick } = useRecordInviteClick();
  const hasRecordedClick = useRef(false);

  useEffect(() => {
    if (inviteCode && !hasRecordedClick.current) {
      hasRecordedClick.current = true;
      setValue(inviteCode);

      recordClick({
        inviteCode,
        referrer: (referrer as InviteReferrer) || 'direct',
      });
    }
  }, [inviteCode, referrer]);
    

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
