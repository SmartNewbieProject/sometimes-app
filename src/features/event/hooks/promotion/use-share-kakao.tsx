import { useToast } from "@/src/shared/hooks/use-toast";
import { shareFeedTemplate } from "@react-native-kakao/share";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import useReferralCode from "./use-referral-code";

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
  const OS = Platform.OS;
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  const inviteCode = referralCode ?? "";

  const TEMPLATE = {
    content: {
      title: "🎉 친구 초대 이벤트 오픈!",
      description:
        "당신과 친구 모두에게 구슬 50개 지급 💜\n 이상형 매칭, 지금 바로 시작하세요!",
      imageUrl: getKakaoImage(),
      link: {
        mobileWebUrl: `${process.env.EXPO_PUBLIC_LINK}?invite-code=${inviteCode}`,
        webUrl: `${process.env.EXPO_PUBLIC_LINK}?invite-code=${inviteCode}`,
      },
    },
    buttons: [
      {
        title: "웹으로 이동",
        link: {
          mobileWebUrl: `${process.env.EXPO_PUBLIC_LINK}?invite-code=${inviteCode}`,
          webUrl: `${process.env.EXPO_PUBLIC_LINK}?invite-code=${inviteCode}`,
        },
      },

      {
        title: "앱으로 이동",
        link: {
          androidExecutionParams: {
            "invite-code": inviteCode,
          },
          iosExecutionParams: {
            "invite-code": inviteCode,
          },
        },
      },
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
        console.error("카카오 SDK 초기화 실패:", error);
        emitToast("카카오 SDK 초기화에 실패했어요");
      }
    };

    script.onerror = (error) => {
      console.error("카카오 SDK 로드 실패:", error);
      emitToast("카카오 SDK 로드에 실패했어요");
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
      emitToast("공유하기 기능을 불러오는 중입니다");
      return;
    }

    try {
      if (!window?.Kakao) {
        emitToast("카카오가 준비되지 않았습니다");
        return;
      }
      console.log(window.Kakao);

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        ...TEMPLATE,
      });
    } catch (error) {
      console.error("카카오 공유 실패:", error);
      emitToast("공유하기를 실패했어요");
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
