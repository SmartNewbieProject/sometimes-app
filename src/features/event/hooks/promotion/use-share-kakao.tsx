import { shareFeedTemplate } from '@react-native-kakao/share';
import React, { useEffect, useState } from 'react';
import {Platform, StyleSheet, View} from 'react-native';



const KAKAO_JS_KEY = "2356db85eb35f5f941d0d66178e16b4e";

const TEMPLATE = {
  content: {
    title: "제목을 입력하세요",
    description: "설명을 입력하세요",
    imageUrl:
      "https://mud-kage.kakao.com/dn/NTmhS/btqfEUdFAUf/FjKzkZsnoeE4o19klTOVI1/openlink_640x640s.jpg",
    link: {
      mobileWebUrl: "https://developers.kakao.com",
      webUrl: "https://developers.kakao.com",
    },
  },
  buttons: [
    {
      title: "웹으로 이동",
      link: {
        mobileWebUrl: "https://developers.kakao.com",
        webUrl: "https://developers.kakao.com",
      },
    },
  ],
}

const SCRIPT = {
  src: "https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js",
  integrity: "sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm",
  crossOrigin: "anonymous",
  async: true
}



function useShareKakao() {
  const OS = Platform.OS
    const kakao = window?.Kakao

const shareNative = () => {
   shareFeedTemplate({
        template: TEMPLATE
      });
}

const state = {
  web: () => {
    if (!kakao) {
      //TODO: toast 추가 필요
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
      script.src = script.src;
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