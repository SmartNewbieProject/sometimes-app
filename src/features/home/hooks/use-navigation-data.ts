import { useMemo } from "react";

import { NavigationMenuItem } from "../types";

export const useNavigationData = (): NavigationMenuItem[] => {
  const menuItems = useMemo<NavigationMenuItem[]>(
    () => [
      {
        id: "beginner-guide",
        title: "썸타임이 처음이신가요?",
        description: "나의 연애관을 알아가고, 연인을 찾도록 도와드립니다",
        backgroundImageUrl: require("@/assets/images/info-miho.png"), // 임시 대체
        onPress: () => {
          // TODO: 온보딩/가이드 페이지로 이동
          console.log("Navigate to onboarding");
        },
      },
      {
        id: "my-moment",
        title: "나의 모먼트",
        description: "썸타임에서 진행중인 이벤트를 확인하고 지금 상품을 받아가세요!",
        backgroundImageUrl: require("@/assets/images/roulette.png"), // 임시 대체
        onPress: () => {
          // TODO: 이벤트/모먼트 페이지로 이동
          console.log("Navigate to events");
        },
      },
      {
        id: "activities",
        title: "다양한 활동",
        description: "나의 연애 성향을 분석해보세요!",
        backgroundImageUrl: require("@/assets/images/interest-info.png"), // 임시 대체
        onPress: () => {
          // TODO: 활동 메뉴 모달 또는 페이지로 이동
          console.log("Navigate to activities");
        },
      },
    ],
    []
  );

  return menuItems;
};