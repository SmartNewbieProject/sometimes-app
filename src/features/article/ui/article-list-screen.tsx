import colors from '@/src/shared/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArticleList } from './article-list';

export const ArticleListScreen = () => {
	const insets = useSafeAreaInsets();

	const ListHeader = () => (
		<View style={styles.header}>
			<Text style={styles.title}>썸타임 이야기</Text>
			<Text style={styles.subtitle}>썸타임이 들려주는 이야기를 만나보세요</Text>
		</View>
	);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ArticleList ListHeaderComponent={<ListHeader />} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.surface.background,
	},
	header: {
		paddingHorizontal: 20,
		paddingBottom: 8,
		gap: 4,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: colors.text.primary,
	},
	subtitle: {
		fontSize: 15,
		color: colors.text.muted,
	},
});
