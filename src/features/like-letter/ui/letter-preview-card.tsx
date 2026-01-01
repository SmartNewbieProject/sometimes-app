import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import type { LetterPreviewData } from '../types';

type LetterPreviewCardProps = {
	data: LetterPreviewData;
	onStartChat?: () => void;
	showChatButton?: boolean;
};

export function LetterPreviewCard({
	data,
	onStartChat,
	showChatButton = true,
}: LetterPreviewCardProps) {
	const { nickname, age, universityName, letter, profileUrl } = data;

	return (
		<View style={styles.container}>
			<View style={styles.profileSection}>
				<Image source={{ uri: profileUrl }} style={styles.profileImage} contentFit="cover" />
				<View style={styles.infoSection}>
					<View style={styles.nameRow}>
						<Text weight="medium" size="20" style={styles.nickname}>
							{nickname}
						</Text>
						<Text size="14" style={styles.age}>
							만 {age}세
						</Text>
					</View>
					<Text size="16" style={styles.university}>
						{universityName}
					</Text>
					{letter && (
						<View style={styles.letterContainer}>
							<View style={styles.letterIconWrapper}>
								<Feather name="mail" size={18} color="#A892D7" />
							</View>
							<Text size="12" style={styles.letterText} numberOfLines={2}>
								{letter}
							</Text>
						</View>
					)}
				</View>
			</View>

			{showChatButton && (
				<Pressable style={styles.chatButton} onPress={onStartChat}>
					<Feather name="message-circle" size={20} color={colors.white} />
					<Text weight="semibold" size="13" style={styles.chatButtonText}>
						대화 시작하기
					</Text>
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.white,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.primaryPurple,
		padding: 15,
		width: '100%',
	},
	profileSection: {
		flexDirection: 'row',
		gap: 15,
	},
	profileImage: {
		width: 68,
		height: 68,
		borderRadius: 34,
	},
	infoSection: {
		flex: 1,
		gap: 6,
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'baseline',
		gap: 12,
	},
	nickname: {
		color: '#111827',
	},
	age: {
		color: '#6B7280',
	},
	university: {
		color: '#4B5563',
	},
	letterContainer: {
		flexDirection: 'row',
		gap: 6,
		marginTop: 4,
	},
	letterIconWrapper: {
		backgroundColor: '#F4F0FD',
		borderRadius: 4,
		padding: 2,
	},
	letterText: {
		flex: 1,
		color: '#6B7280',
		lineHeight: 16,
	},
	chatButton: {
		backgroundColor: colors.primaryPurple,
		borderRadius: 7,
		height: 34,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
		marginTop: 15,
	},
	chatButtonText: {
		color: colors.white,
	},
});
