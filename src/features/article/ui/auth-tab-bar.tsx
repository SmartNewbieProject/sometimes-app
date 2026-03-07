import colors from '@/src/shared/constants/colors';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AuthTab = 'login' | 'story';

interface AuthTabBarProps {
	activeTab: AuthTab;
	onTabChange: (tab: AuthTab) => void;
}

export const AuthTabBar = ({ activeTab, onTabChange }: AuthTabBarProps) => {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const { sometimeStoryEvents } = useMixpanel();

	const handleTabChange = (tab: AuthTab) => {
		if (tab === 'story') {
			sometimeStoryEvents.trackAuthTabClicked();
		}
		onTabChange(tab);
	};

	return (
		<View style={[styles.container, { top: insets.top + 144 }]}>
			<Pressable
				style={[styles.tab, activeTab === 'login' ? styles.activeTab : styles.inactiveTab]}
				onPress={() => handleTabChange('login')}
			>
				<Ionicons
					name={activeTab === 'login' ? 'person' : 'person-outline'}
					size={18}
					color={activeTab === 'login' ? '#FFFFFF' : colors.text.muted}
				/>
				<Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
					{t('features.auth.auth_tab_bar.login')}
				</Text>
			</Pressable>

			<Pressable
				style={[styles.tab, styles.storyTab, activeTab === 'story' ? styles.activeTab : styles.inactiveTab, { marginTop: 6 }]}
				onPress={() => handleTabChange('story')}
			>
				<Ionicons
					name={activeTab === 'story' ? 'book' : 'book-outline'}
					size={18}
					color={activeTab === 'story' ? '#FFFFFF' : colors.text.muted}
				/>
				<Text style={[styles.tabText, activeTab === 'story' && styles.activeTabText]} numberOfLines={2}>
					{t('features.auth.auth_tab_bar.story')}
				</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		right: 0,
		flexDirection: 'column',
		alignItems: 'flex-end',
	},
	tab: {
		width: 56,
		paddingVertical: 10,
		paddingLeft: 10,
		paddingRight: 12,
		borderTopLeftRadius: 14,
		borderBottomLeftRadius: 14,
		alignItems: 'center',
		gap: 4,
		shadowColor: '#000',
		shadowOffset: { width: -2, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 6,
		elevation: 4,
	},
	storyTab: {
		width: 76,
		paddingVertical: 14,
	},
	activeTab: {
		backgroundColor: colors.brand.primary,
	},
	inactiveTab: {
		backgroundColor: 'rgba(255, 255, 255, 0.92)',
	},
	tabText: {
		fontSize: 9,
		color: colors.text.muted,
		fontWeight: '500',
		textAlign: 'center',
	},
	activeTabText: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
});
