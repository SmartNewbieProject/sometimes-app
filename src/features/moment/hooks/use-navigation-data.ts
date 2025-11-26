import { useMemo } from "react";
import { MomentNavigationItem } from "../types";

export const useMomentNavigationData = (): MomentNavigationItem[] => {
  return useMemo(
    () => [
      {
        id: "moment-discover",
        title: "💝 인연찾기",
        description: "새로운 만남을 시작해보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/F9F7FF/666666?text=❤️",
        onPress: () => {
          console.log("인연찾기로 이동");
        },
      },
      {
        id: "moment-chatting",
        title: "💬 채팅",
        description: "실시간으로 대화를 나눠보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/E2D6FF/666666?text=💬",
        onPress: () => {
          console.log("채팅으로 이동");
        },
      },
      {
        id: "moment-community",
        title: "🌟 커뮤니티",
        description: "다른 사람들과 소통해보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/F9F7FF/666666?text=🌟",
        onPress: () => {
          console.log("커뮤니티로 이동");
        },
      },
      {
        id: "moment-profile",
        title: "👤 프로필",
        description: "나의 매력을 어필해보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/E2D6FF/666666?text=👤",
        onPress: () => {
          console.log("프로필로 이동");
        },
      },
      {
        id: "moment-events",
        title: "🎉 이벤트",
        description: "특별한 혜택을 만나보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/F9F7FF/666666?text=🎉",
        onPress: () => {
          console.log("이벤트로 이동");
        },
      },
      {
        id: "moment-settings",
        title: "⚙️ 설정",
        description: "앱 설정을 관리해보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/E2D6FF/666666?text=⚙️",
        onPress: () => {
          console.log("설정으로 이동");
        },
      },
    ],
    []
  );
};