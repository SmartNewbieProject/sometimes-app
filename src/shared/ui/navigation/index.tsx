import { IconWrapper } from "@/src/shared/ui/icons";
import { Text } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import React, { type ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "@/src/shared/constants/colors";

import CommunitySelected from "@/assets/icons/nav/community-selected.svg";
import CommunityUnselected from "@/assets/icons/nav/community-unselected.svg";
import HomeSelected from "@/assets/icons/nav/home-selected.svg";
import HomeUnselected from "@/assets/icons/nav/home-unselected.svg";
import MySelected from "@/assets/icons/nav/my-selected.svg";
import MyUnselected from "@/assets/icons/nav/my-unselected.svg";
import ChatSeleted from "@assets/icons/nav/chat-selected.svg";
import ChatUnseleted from "@assets/icons/nav/chat-unselected.svg";

type NavItem = "home" | "community" | "chat" | "moment" | "my";

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
    unSelected: <ChatUnseleted />,
  },
  moment: {
    selected: <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require("@/assets/images/moment/moment-on.png")}
        style={{ width: 20, height: 20 }}
        contentFit="contain"
      />
    </View>,
    unSelected: <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require("@/assets/images/moment/moment-off.png")}
        style={{ width: 20, height: 20 }}
        contentFit="contain"
      />
    </View>,
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
  // 모먼트 메뉴 임시 비활성화
  // {
  //   name: "moment",
  //   label: "모먼트",
  //   path: "/moment",
  //   icon: NavIcons.moment,
  // },
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
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavClick(item.path)}
          >
            <IconWrapper width={24} height={24} style={styles.iconWrapper}>
              {isActive(item.path) ? item.icon.selected : item.icon.unSelected}
            </IconWrapper>
            <Text
              size="sm"
              weight={isActive(item.path) ? "semibold" : "normal"}
              textColor={isActive(item.path) ? colors.primaryPurple : colors.lightPurple}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopColor: colors.lightPurple,
    borderTopWidth: 1,
    paddingBottom: 16,
    width: '100%',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 4,
  },
});
