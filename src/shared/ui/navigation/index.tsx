import { useAppInstallPrompt } from '@/src/features/app-install-prompt';
import { useUnreadChatCount } from '@/src/features/chat/hooks/use-unread-chat-count';
import { useMomentEnabled } from '@/src/features/moment/queries/use-moment-enabled';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { IconWrapper } from '@/src/shared/ui/icons';
import { Text } from '@/src/shared/ui/text';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import React, { type ReactNode, useCallback } from 'react';
import { Text as RNText, StyleSheet, TouchableOpacity, View } from 'react-native';

import CommunitySelected from '@/assets/icons/nav/community-selected.svg';
import CommunityUnselected from '@/assets/icons/nav/community-unselected.svg';
import HomeSelected from '@/assets/icons/nav/home-selected.svg';
import HomeUnselected from '@/assets/icons/nav/home-unselected.svg';
import MySelected from '@/assets/icons/nav/my-selected.svg';
import MyUnselected from '@/assets/icons/nav/my-unselected.svg';
import i18n from '@/src/shared/libs/i18n';
import ChatSeleted from '@assets/icons/nav/chat-selected.svg';
import ChatUnseleted from '@assets/icons/nav/chat-unselected.svg';

type NavItem = 'home' | 'community' | 'chat' | 'moment' | 'my';

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
		selected: (
			<View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
				<Image
					source={require('@/assets/images/moment/moment-on.png')}
					style={{ width: 24, height: 24 }}
					contentFit="contain"
				/>
			</View>
		),
		unSelected: (
			<View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
				<Image
					source={require('@/assets/images/moment/moment-off.png')}
					style={{ width: 24, height: 24 }}
					contentFit="contain"
				/>
			</View>
		),
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
		name: 'home',
		label: i18n.t('shareds.navigation.bottom_navigation.home'),
		path: '/home',
		icon: NavIcons.home,
	},
	{
		name: 'community',
		label: i18n.t('shareds.navigation.bottom_navigation.community'),
		path: '/community',
		icon: NavIcons.community,
	},
	{
		name: 'chat',
		label: i18n.t('shareds.navigation.bottom_navigation.chat'),
		path: '/chat',
		icon: NavIcons.chat,
	},
	{
		name: 'moment',
		label: i18n.t('shareds.navigation.bottom_navigation.moment'),
		path: '/moment',
		icon: NavIcons.moment,
	},
	{
		name: 'my',
		label: i18n.t('shareds.navigation.bottom_navigation.my'),
		path: '/my',
		icon: NavIcons.my,
	},
];

export function BottomNavigation() {
	const pathname = usePathname();
	const { data: momentEnabled } = useMomentEnabled();
	const unreadChatCount = useUnreadChatCount();
	const { incrementNavClickCount, showPromptForNavClick } = useAppInstallPrompt();

	const canAccessMoment = momentEnabled?.enabled ?? false;

	const isActive = (path: string) => {
		if (pathname.includes('/chat/somemate')) {
			return path === '/moment';
		}
		return pathname.startsWith(path);
	};

	const handleNavClick = useCallback(
		async (path: string) => {
			if (isActive(path)) return;

			const shouldShowPrompt = await incrementNavClickCount();
			if (shouldShowPrompt) {
				await showPromptForNavClick();
			}

			router.push(path as any);
		},
		[incrementNavClickCount, showPromptForNavClick],
	);
	return (
		<View style={styles.container}>
			<View style={styles.navContainer}>
				{navigationItems
					.filter((item) => item.name !== 'moment' || canAccessMoment)
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
								weight={isActive(item.path) ? 'semibold' : 'normal'}
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
		backgroundColor: semanticColors.surface.card,
		borderTopColor: semanticColors.border.card,
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
		color: semanticColors.text.inverse,
		fontSize: 10,
		fontWeight: '700',
		lineHeight: 12,
	},
});
