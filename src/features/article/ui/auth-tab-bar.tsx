import colors from '@/src/shared/constants/colors';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AuthTab = 'login' | 'story';

interface AuthTabBarProps {
	activeTab: AuthTab;
	onTabChange: (tab: AuthTab) => void;
}

export const AuthTabBar = ({ activeTab, onTabChange }: AuthTabBarProps) => {
	const insets = useSafeAreaInsets();
	const { sometimeStoryEvents } = useMixpanel();

	const handleTabChange = (tab: AuthTab) => {
		if (tab === 'story') {
			sometimeStoryEvents.trackAuthTabClicked();
		}
		onTabChange(tab);
	};

	return (
		<View style={[styles.container, { paddingBottom: Math.max(insets.bottom - 24, 0) }]}>
			<Pressable
				style={[styles.tab, activeTab === 'login' && styles.activeTab]}
				onPress={() => handleTabChange('login')}
			>
				<Ionicons
					name={activeTab === 'login' ? 'person' : 'person-outline'}
					size={22}
					color={activeTab === 'login' ? colors.brand.primary : colors.text.muted}
				/>
				<Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>로그인</Text>
			</Pressable>

			<Pressable
				style={[styles.tab, activeTab === 'story' && styles.activeTab]}
				onPress={() => handleTabChange('story')}
			>
				<Ionicons
					name={activeTab === 'story' ? 'book' : 'book-outline'}
					size={22}
					color={activeTab === 'story' ? colors.brand.primary : colors.text.muted}
				/>
				<Text style={[styles.tabText, activeTab === 'story' && styles.activeTabText]}>
					썸타임 이야기
				</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.surface.background,
		borderTopWidth: 1,
		borderTopColor: colors.border.smooth,
		paddingTop: 8,
	},
	tab: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
		marginBottom: 4,
		gap: 4,
	},
	activeTab: {},
	tabText: {
		fontSize: 11,
		color: colors.text.muted,
		fontWeight: '500',
	},
	activeTabText: {
		color: colors.brand.primary,
		fontWeight: '600',
	},
});
