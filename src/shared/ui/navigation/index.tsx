import { IconWrapper } from "@/src/shared/ui/icons";
import { Text } from "@/src/shared/ui/text";
import { router, usePathname } from "expo-router";
import React, { type ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";

import CommunitySelected from "@/assets/icons/nav/community-selected.svg";
import CommunityUnselected from "@/assets/icons/nav/community-unselected.svg";
import HomeSelected from "@/assets/icons/nav/home-selected.svg";
import HomeUnselected from "@/assets/icons/nav/home-unselected.svg";
import MySelected from "@/assets/icons/nav/my-selected.svg";
import MyUnselected from "@/assets/icons/nav/my-unselected.svg";
import ChatSeleted from "@assets/icons/nav/chat-selected.svg";

type NavItem = "home" | "community" | "chat" | "my";

const NavIcons: Record<
  NavItem,
  {
    selected: ReactNode;
    unSelected: ReactNode;
  }
> = {
  home: {
    selected: <HomeSelected />,
    unSelected: <HomeUnselected />,
  },
  community: {
    selected: <CommunitySelected />,
    unSelected: <CommunityUnselected />,
  },
  my: {
    selected: <MySelected />,
    unSelected: <MyUnselected />,
  },
  chat: {
    selected: <ChatSeleted />,
    unSelected: <ChatSeleted />,
  },
};

type NavigationItem = {
  name: string;
  label: string;
  path: string;
  icon: (typeof NavIcons)[NavItem];
};

const navigationItems: NavigationItem[] = [
  {
    name: "home",
    label: "홈",
    path: "/home",
    icon: NavIcons.home,
  },
  {
    name: "community",
    label: "커뮤니티",
    path: "/community",
    icon: NavIcons.community,
  },
  {
    name: "chat",
    label: "채팅",
    path: "/chat",
    icon: NavIcons.chat,
  },
  {
    name: "my",
    label: "MY",
    path: "/my",
    icon: NavIcons.my,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    if (isActive(path)) return;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    router.push(path as any);
  };
  return (
    <View className="bg-white border-t border-lightPurple pb-4">
      <View className="flex-row justify-around py-3">
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            className="items-center"
            onPress={() => handleNavClick(item.path)}
          >
            <IconWrapper width={24} height={24} className="mb-1">
              {isActive(item.path) ? item.icon.selected : item.icon.unSelected}
            </IconWrapper>
            <Text
              size="sm"
              weight={isActive(item.path) ? "semibold" : "normal"}
              textColor={isActive(item.path) ? "purple" : "pale-purple"}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
