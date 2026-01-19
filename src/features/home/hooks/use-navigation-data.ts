import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { NavigationMenuItem } from "../types";
import { devLogWithTag } from "@/src/shared/utils";

export const useNavigationData = (): NavigationMenuItem[] => {
  const { t } = useTranslation();

  const menuItems = useMemo<NavigationMenuItem[]>(
    () => [
      {
        id: "beginner-guide",
        title: "features.home.ui.navigation_menu.beginner_guide_title",
        description: "features.home.ui.navigation_menu.beginner_guide_description",
        backgroundImageUrl: require("@/assets/images/info-miho.webp"),
        onPress: () => {
          devLogWithTag('Navigation', 'TODO: onboarding');
        },
      },
      {
        id: "my-moment",
        title: "features.home.ui.navigation_menu.my_moment_title",
        description: "features.home.ui.navigation_menu.my_moment_description",
        backgroundImageUrl: require("@/assets/images/roulette.webp"),
        onPress: () => {
          devLogWithTag('Navigation', 'TODO: events');
        },
      },
      {
        id: "activities",
        title: "features.home.ui.navigation_menu.activities_title",
        description: "features.home.ui.navigation_menu.activities_description",
        backgroundImageUrl: require("@/assets/images/interest-info.png"),
        onPress: () => {
          devLogWithTag('Navigation', 'TODO: activities');
        },
      },
    ],
    [t]
  );

  return menuItems;
};