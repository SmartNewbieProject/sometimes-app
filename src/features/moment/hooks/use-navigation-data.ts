import { useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { MomentNavigationItem } from "../types";
import { devLogWithTag } from "@/src/shared/utils";

export const useMomentNavigationData = (): MomentNavigationItem[] => {
  return useMemo(
    () => [
      {
        id: "moment-discover",
        title: "💝 인연찾기",
        description: "hooks.새로운_만남을_시작해보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/F9F7FF/666666?text=❤️",
        onPress: () => {
          devLogWithTag('Moment Nav', 'TODO: 인연찾기');
        },
      },
      {
        id: "moment-chatting",
        title: "💬 채팅",
        description: "hooks.실시간으로_대화를_나눠보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/E2D6FF/666666?text=💬",
        onPress: () => {
          devLogWithTag('Moment Nav', 'TODO: 채팅');
        },
      },
      {
        id: "moment-community",
        title: "🌟 커뮤니티",
        description: "hooks.다른_사람들과_소통해보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/F9F7FF/666666?text=🌟",
        onPress: () => {
          devLogWithTag('Moment Nav', 'TODO: 커뮤니티');
        },
      },
      {
        id: "moment-profile",
        title: "👤 프로필",
        description: "hooks.나의_매력을_어필해보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/E2D6FF/666666?text=👤",
        onPress: () => {
          devLogWithTag('Moment Nav', 'TODO: 프로필');
        },
      },
      {
        id: "moment-events",
        title: "🎉 이벤트",
        description: "hooks.특별한_혜택을_만나보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/F9F7FF/666666?text=🎉",
        onPress: () => {
          devLogWithTag('Moment Nav', 'TODO: 이벤트');
        },
      },
      {
        id: "moment-settings",
        title: "⚙️ 설정",
        description: "hooks.앱_설정을_관리해보세요",
        backgroundImageUrl: "https://via.placeholder.com/60x60/E2D6FF/666666?text=⚙️",
        onPress: () => {
          devLogWithTag('Moment Nav', 'TODO: 설정');
        },
      },
    ],
    []
  );
};