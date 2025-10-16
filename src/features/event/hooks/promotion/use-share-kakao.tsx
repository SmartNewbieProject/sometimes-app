import { useToast } from '@/src/shared/hooks/use-toast';
import { shareFeedTemplate } from '@react-native-kakao/share';
import React, { useEffect, useState } from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import useReferralCode from './use-referral-code';
import CopyIcon from "@assets/icons/toast/copy.svg"


const KAKAO_JS_KEY = "2356db85eb35f5f941d0d66178e16b4e";




const SCRIPT = {
  src: "https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js",
  integrity: "sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm",
  crossOrigin: "anonymous",
  async: true
}



function useShareKakao() {
  const { emitToast } = useToast();
  const {referralCode} = useReferralCode()
  const OS = Platform.OS
    const kakao = window?.Kakao
  
  const TEMPLATE = {
    content: {
      title: "🎉 친구 초대 이벤트 오픈!",
      description: "당신과 친구 모두에게 구슬 50개 지급 💜\n 이상형 매칭, 지금 바로 시작하세요!",
      imageUrl:
        "https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/invitebanner.png",
      link: {
        mobileWebUrl: `${process.env.EXPO_PUBLIC_LINK}?invite-code=${referralCode}`,
        webUrl: `${process.env.EXPO_PUBLIC_LINK}?invite-code=${referralCode}`,
      },
    },
    buttons: [
      {
        title: "웹으로 이동",
        link: {
          mobileWebUrl:`${process.env.EXPO_PUBLIC_LINK}?invite-code=${referralCode}`,
          webUrl: `${process.env.EXPO_PUBLIC_LINK}?invite-code=${referralCode}`,
        },
      },
      {
        title: "앱으로 이동",
        link: {
          androidExecutionParams: { "invite-code": referralCode ??"" },
          iosExecutionParams: { "invite-code": referralCode?? "" },
        },
      },
    ],
  }
  

const shareNative = () => {
   shareFeedTemplate({
        template: TEMPLATE
      });
}

const state = {
  web: () => {
    if (!kakao) {
      
      emitToast("공유하기 기능을 불러오는데 실패했어요" )
      return;
    }

    kakao.Share.sendDefault({
      objectType: "feed",
      ...TEMPLATE
    });
  
  },
  ios: shareNative,
  android: shareNative,
  windows: shareNative,
  macos: shareNative 
  

}
  useEffect(() => {
    if (OS === "web") {
      if (kakao) {
        if (!kakao.isInitialized()) {
          kakao.init(KAKAO_JS_KEY);
        }
        return;
      }
  
      const script = document.createElement("script");
      script.src = SCRIPT.src;
      script.integrity =
        SCRIPT.integrity;
      script.crossOrigin = SCRIPT.crossOrigin;
      script.async = SCRIPT.async;
  
      script.onload = () => {
        try {
          if (kakao && !kakao.isInitialized()) {
            kakao.init(KAKAO_JS_KEY);
          }
        } catch (error) {
          console.error("카카오 SDK 초기화 실패:", error);
        }
      };
  
      script.onerror = (error) => {
        console.error("카카오 SDK 로드 실패:", error);
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
    }
  }, []);


  const handleShareKakao = () => {
    state[OS]()
  };
  return {
    handleShareKakao
  }
}


export default useShareKakao;