import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Chat } from '../../types/chat';

const SystemMessage = ({ item }: { item: Chat }) => {
	const queryClient = useQueryClient();
	const { id } = useLocalSearchParams<{ id: string }>();

	useEffect(() => {
		queryClient.refetchQueries({ queryKey: ['chat-detail', id] });
	}, []);
	return (
		<View style={styles.dateDividerContainer}>
			<Text style={[styles.dateText, { fontSize: 14 }]}>안내</Text>
			<Text style={[styles.dateText, { paddingVertical: 2 }]}>{item.content}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	dateDividerContainer: {
		alignItems: 'center',
		marginVertical: 5,
		paddingVertical: 8,
		paddingHorizontal: 10,

		borderRadius: 10,

		borderWidth: StyleSheet.hairlineWidth,
		borderColor: semanticColors.text.muted,
	},
	dateText: {
		fontSize: 13,
		color: semanticColors.text.disabled,
		fontWeight: '400',

		paddingHorizontal: 9,
		paddingVertical: 4,
	},
});

export default SystemMessage;
