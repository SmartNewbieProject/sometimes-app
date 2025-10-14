import { tryCatch } from "@/src/shared/libs";
import { shareFeedTemplate } from "@react-native-kakao/share";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    Kakao?: any;
  }
}

function useShare() {
  const [isPending, setPending] = useState(false);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const KAKAO_JS_KEY = "2356db85eb35f5f941d0d66178e16b4e";

useEffect(() => {
  if (Platform.OS === "web") {
    // 이미 로드되어 있는지 확인
    if (window?.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
      }
      setIsKakaoLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js";
    script.integrity =
      "sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm";
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => {
      try {
        if (window?.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_JS_KEY);
          setIsKakaoLoaded(true);
          console.log("카카오 SDK 초기화 완료");
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

  const handleShareLink = async () => {
    try {
      setPending(true);
      await Clipboard.setStringAsync("http://localhost:3000");
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  const handleShareKakao = () => {
    if (Platform.OS === "web") {
      if (!window.Kakao) {
        alert("카카오 SDK가 로드되지 않았습니다.");
        return;
      }

      window.Kakao.Share.sendDefault({
        objectType: "feed",
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
      });
    } else {
      shareFeedTemplate({
        template: {
          content: {
            title: "SOMETIME - 썸타임",
            description: "땃쥐가 일하는 곳은? 맘스땃쥐 ㅋㅋ",
            imageUrl:
              "https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/profiles/0196020a-bf95-7a7b-94d4-b273a11cf4ce/01960492-8d75-7681-82ed-65feb1c318c1.png",
            link: {
              webUrl: "http://localhost:3000",
              mobileWebUrl: "http://localhost:3000",
            },
          },
          buttons: [
            {
              title: "웹으로 보기",
              link: {
                webUrl: "http://localhost:3000",
                mobileWebUrl: "https://developers.kakao.com",
              },
            },
            {
              title: "앱으로 보기",
              link: {
                androidExecutionParams: {},
                iosExecutionParams: {},
              },
            },
          ],
        },
      });
    }
  };

  return {
    isPending,
    handleShareLink,
    handleShareKakao,
  };
}

const styles = StyleSheet.create({});

export default useShare;
