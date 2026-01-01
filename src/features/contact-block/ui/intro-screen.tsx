import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';

interface IntroScreenProps {
	onRequestContacts: () => void;
	onSkip: () => void;
	isLoading?: boolean;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
	onRequestContacts,
	onSkip,
	isLoading = false,
}) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.iconContainer}>
					<Text style={styles.emoji}>🔒</Text>
				</View>

				<Text size="xl" weight="bold" textColor="black" style={styles.title}>
					혹시 아는 사람 만날까{'\n'}걱정되시나요?
				</Text>

				<Text size="md" textColor="gray" style={styles.description}>
					연락처에 있는 사람들은{'\n'}
					서로 프로필이 보이지 않아요.
				</Text>

				<View style={styles.benefitCard}>
					<View style={styles.benefitItem}>
						<Text style={styles.checkIcon}>✓</Text>
						<Text size="md" textColor="black">
							전 남친도 마주칠 일 없어요
						</Text>
					</View>
					<View style={styles.benefitItem}>
						<Text style={styles.checkIcon}>✓</Text>
						<Text size="md" textColor="black">
							동기, 선후배도 걱정 끝
						</Text>
					</View>
					<View style={styles.benefitItem}>
						<Text style={styles.checkIcon}>✓</Text>
						<Text size="md" textColor="black">
							안심하고 새로운 설렘을 찾으세요
						</Text>
					</View>
				</View>

				<View style={styles.privacyNote}>
					<Text size="sm" textColor="gray" style={styles.privacyText}>
						🛡️ 연락처는 안전하게 암호화되어 전송되며,{'\n'}
						원본은 저장되지 않아요.
					</Text>
				</View>
			</ScrollView>

			<View style={styles.buttonContainer}>
				<Button
					variant="primary"
					size="lg"
					width="full"
					onPress={onRequestContacts}
					disabled={isLoading}
				>
					{isLoading ? t('ui.확인_중') : t('ui.내_연락처_확인하기')}
				</Button>

				<Button
					variant="secondary"
					size="md"
					width="full"
					onPress={onSkip}
					style={styles.skipButton}
				>
					다음에 할게요
				</Button>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 24,
		paddingTop: 40,
		alignItems: 'center',
	},
	iconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: semanticColors.surface.secondary,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 24,
	},
	emoji: {
		fontSize: 40,
	},
	title: {
		textAlign: 'center',
		marginBottom: 16,
		lineHeight: 32,
	},
	description: {
		textAlign: 'center',
		marginBottom: 32,
		lineHeight: 24,
	},
	benefitCard: {
		width: '100%',
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 16,
		padding: 20,
		gap: 16,
	},
	benefitItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	checkIcon: {
		fontSize: 16,
		color: colors.primaryPurple,
		fontWeight: 'bold',
	},
	privacyNote: {
		marginTop: 24,
		paddingHorizontal: 16,
	},
	privacyText: {
		textAlign: 'center',
		lineHeight: 20,
	},
	buttonContainer: {
		paddingHorizontal: 24,
		gap: 12,
	},
	skipButton: {
		marginTop: 4,
	},
});
