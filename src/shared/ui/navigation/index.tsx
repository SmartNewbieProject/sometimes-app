import { IconWrapper } from "@/src/shared/ui/icons";
import { Text } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import React, { type ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View, Text as RNText } from "react-native";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useMomentEnabled } from "@/src/features/moment/queries/use-moment-enabled";
import { useUnreadChatCount } from "@/src/features/chat/hooks/use-unread-chat-count";

import CommunitySelected from "@/assets/icons/nav/community-selected.svg";
import CommunityUnselected from "@/assets/icons/nav/community-unselected.svg";
import HomeSelected from "@/assets/icons/nav/home-selected.svg";
import HomeUnselected from "@/assets/icons/nav/home-unselected.svg";
import MySelected from "@/assets/icons/nav/my-selected.svg";
import MyUnselected from "@/assets/icons/nav/my-unselected.svg";
import ChatSeleted from "@assets/icons/nav/chat-selected.svg";
import ChatUnseleted from "@assets/icons/nav/chat-unselected.svg";
import i18n from "@/src/shared/libs/i18n";

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
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
    </View>,
    unSelected: <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require("@/assets/images/moment/moment-off.png")}
        style={{ width: 24, height: 24 }}
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
    label: i18n.t("shareds.navigation.bottom_navigation.home"),
    path: "/home",
    icon: NavIcons.home,
  },
  {
    name: "community",
    label: i18n.t("shareds.navigation.bottom_navigation.community"),
    path: "/community",
    icon: NavIcons.community,
  },
  {
    name: "chat",
    label: i18n.t("shareds.navigation.bottom_navigation.chat"),
    path: "/chat",
    icon: NavIcons.chat,
  },
  {
    name: "moment",
    label: i18n.t("shareds.navigation.bottom_navigation.moment"),
    path: "/moment",
    icon: NavIcons.moment,
  },
  {
    name: "my",
    label: i18n.t("shareds.navigation.bottom_navigation.my"),
    path: "/my",
    icon: NavIcons.my,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { data: momentEnabled } = useMomentEnabled();
  const unreadChatCount = useUnreadChatCount();

  const canAccessMoment = momentEnabled?.enabled ?? false;

  const isActive = (path: string) => {
    // 썸메이트 경로인 경우 모먼트 탭 활성화
    if (pathname.includes('/chat/somemate')) {
      return path === '/moment';
    }
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
        {navigationItems
          .filter(item => item.name !== 'moment' || canAccessMoment)
          .map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavClick(item.path)}
          >
            <View style={styles.iconContainer}>
              <IconWrapper width={24} height={24} style={styles.iconWrapper}>
                {isActive(item.path) ? item.icon.selected : item.icon.unSelected}
              </IconWrapper>
              {item.name === 'chat' && unreadChatCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadChatCount > 99 ? '99+' : unreadChatCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              size="sm"
              weight={isActive(item.path) ? "semibold" : "normal"}
              textColor="black"
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
  iconContainer: {
    position: 'relative',
  },
  iconWrapper: {
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: semanticColors.state.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
