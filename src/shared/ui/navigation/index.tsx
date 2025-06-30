import { IconWrapper } from '@/src/shared/ui/icons';
import { Text } from '@/src/shared/ui/text';
import { router, usePathname } from 'expo-router';
import React, { type ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';

import CommunitySelected from '@/assets/icons/nav/community-selected.svg';
import CommunityUnselected from '@/assets/icons/nav/community-unselected.svg';
import HomeSelected from '@/assets/icons/nav/home-selected.svg';
import HomeUnselected from '@/assets/icons/nav/home-unselected.svg';
import MySelected from '@/assets/icons/nav/my-selected.svg';
import MyUnselected from '@/assets/icons/nav/my-unselected.svg';

type NavItem = 'home' | 'community' | 'my';

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
		label: '홈',
		path: '/home',
		icon: NavIcons.home,
	},
	{
		name: 'community',
		label: '커뮤니티',
		path: '/community',
		icon: NavIcons.community,
	},
	{
		name: 'my',
		label: 'MY',
		path: '/my',
		icon: NavIcons.my,
	},
];

export function BottomNavigation() {
	const pathname = usePathname();

	const isActive = (path: string) => {
		return pathname.startsWith(path);
	};

	return (
		<View className="bg-white border-t border-lightPurple pb-4">
			<View className="flex-row justify-around py-3">
				{navigationItems.map((item) => (
					<TouchableOpacity
						key={item.name}
						className="items-center"
						onPress={() => router.push(item.path as any)}
					>
						<IconWrapper width={24} height={24} className="mb-1">
							{isActive(item.path) ? item.icon.selected : item.icon.unSelected}
						</IconWrapper>
						<Text
							size="sm"
							weight={isActive(item.path) ? 'semibold' : 'normal'}
							textColor={isActive(item.path) ? 'purple' : 'pale-purple'}
						>
							{item.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
}
