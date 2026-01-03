import { useToast } from "@/src/shared/hooks/use-toast";
import { env } from "@/src/shared/libs/env";
import { shareFeedTemplate } from "@react-native-kakao/share";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import useReferralCode from "./use-referral-code";
import { useTranslation } from "react-i18next";

const KAKAO_JS_KEY = "2356db85eb35f5f941d0d66178e16b4e";

const SCRIPT = {
  src: "https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js",
  integrity:
    "sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm",
  crossOrigin: "anonymous",
  async: true,
};

function useShareKakao() {
  const { emitToast } = useToast();
  const { referralCode } = useReferralCode();
  const { t } = useTranslation();
  const OS = Platform.OS;
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  const inviteCode = referralCode ?? "";

  const TEMPLATE = {
    content: {
      title: t("features.event.hooks.use_share_kakao.invite_title"),
      description: t("features.event.hooks.use_share_kakao.invite_description"),
      imageUrl: getKakaoImage(),
      link: {
        mobileWebUrl: `${env.LINK}?invite-code=${inviteCode}`,
        webUrl: `${env.LINK}?invite-code=${inviteCode}`,
      },
    },
    buttons: [
      {
        title: t("features.event.hooks.use_share_kakao.button_web"),
        link: {
          mobileWebUrl: `${env.LINK}?invite-code=${inviteCode}`,
          webUrl: `${env.LINK}?invite-code=${inviteCode}`,
        },
      },

      ...(Platform.OS !== "web"
        ? [
            {
              title: t("features.event.hooks.use_share_kakao.button_app"),
              link: {
                androidExecutionParams: {
                  "invite-code": inviteCode,
                },
                iosExecutionParams: {
                  "invite-code": inviteCode,
                },
              },
            },
          ]
        : []),
    ],
  };

  useEffect(() => {
    if (OS !== "web") return;

    if (window?.Kakao?.isInitialized?.()) {
      setIsKakaoReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT.src;
    script.integrity = SCRIPT.integrity;
    script.crossOrigin = SCRIPT.crossOrigin;
    script.async = SCRIPT.async;

    script.onload = () => {
      try {
        if (!window.Kakao) {
          throw new Error("Kakao SDK not loaded");
        }

        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_JS_KEY);
        }
        setIsKakaoReady(true);
      } catch (error) {
        console.error("Kakao SDK init failed:", error);
        emitToast(t("features.event.hooks.use_share_kakao.sdk_init_failed"));
      }
    };

    script.onerror = (error) => {
      console.error("Kakao SDK load failed:", error);
      emitToast(t("features.event.hooks.use_share_kakao.sdk_load_failed"));
    };

    document.body.appendChild(script);

    return () => {
      try {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      } catch (error) {
        console.error("Script 제거 실패:", error);
      }
    };
  }, [OS, emitToast]);

  const handleShareKakao = () => {
    if (OS !== "web") {
      shareFeedTemplate({
        template: TEMPLATE,
      });
      return;
    }

    if (!isKakaoReady) {
      emitToast(t("features.event.hooks.use_share_kakao.share_loading"));
      return;
    }

    try {
      if (!window?.Kakao) {
        emitToast(t("features.event.hooks.use_share_kakao.kakao_not_ready"));
        return;
      }
      console.log(window.Kakao);

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        ...TEMPLATE,
      });
    } catch (error) {
      console.error("Kakao share failed:", error);
      emitToast(t("features.event.hooks.use_share_kakao.share_failed"));
    }
  };

  return {
    handleShareKakao,
    isReady: isKakaoReady,
  };
}

function getKakaoImage() {
  const BASE_URL =
    "https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources";
  return Math.random() < 0.5
    ? `${BASE_URL}/v1invitefriend.png`
    : `${BASE_URL}/v2invitefriend.png`;
}

export default useShareKakao;
