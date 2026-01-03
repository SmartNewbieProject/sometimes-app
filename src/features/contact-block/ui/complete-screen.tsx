import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';

interface CompleteScreenProps {
	blockedCount: number;
	onComplete: () => void;
}

export const CompleteScreen: React.FC<CompleteScreenProps> = ({ blockedCount, onComplete }) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.sequence([
			Animated.spring(scaleAnim, {
				toValue: 1,
				tension: 50,
				friction: 7,
				useNativeDriver: true,
			}),
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
			<View style={styles.content}>
				<Animated.View
					style={[
						styles.iconContainer,
						{
							transform: [{ scale: scaleAnim }],
						},
					]}
				>
					<Text style={styles.emoji}>🎉</Text>
				</Animated.View>

				<Animated.View style={{ opacity: fadeAnim }}>
					<Text size="xl" weight="bold" textColor="black" style={styles.title}>
						설정 완료!
					</Text>

					<Text size="md" textColor="gray" style={styles.description}>
						{blockedCount > 0
							? `${blockedCount}명의 연락처가 확인됐어요.`
							: t('ui.안심_설정이_완료됐어요')}
					</Text>

					<View style={styles.messageCard}>
						<Text size="md" textColor="black" style={styles.messageText}>
							이제 편하게{'\n'}
							새로운 설렘을 찾아보세요! 💜
						</Text>
					</View>

					<View style={styles.infoContainer}>
						<View style={styles.infoItem}>
							<Text style={styles.infoIcon}>🔄</Text>
							<Text size="sm" textColor="gray" style={styles.infoText}>
								연락처가 추가되면 자동으로 업데이트돼요
							</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoIcon}>⚙️</Text>
							<Text size="sm" textColor="gray" style={styles.infoText}>
								설정에서 언제든 변경할 수 있어요
							</Text>
						</View>
					</View>
				</Animated.View>
			</View>

			<View style={styles.buttonContainer}>
				<Button variant="primary" size="lg" width="full" onPress={onComplete}>
					새로운 인연 만나러 가기
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
	content: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 60,
		alignItems: 'center',
	},
	iconContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: semanticColors.surface.secondary,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 32,
	},
	emoji: {
		fontSize: 48,
	},
	title: {
		textAlign: 'center',
		marginBottom: 8,
	},
	description: {
		textAlign: 'center',
		marginBottom: 32,
	},
	messageCard: {
		backgroundColor: colors.primaryPurple,
		borderRadius: 16,
		paddingVertical: 20,
		paddingHorizontal: 32,
		marginBottom: 32,
	},
	messageText: {
		color: colors.white,
		textAlign: 'center',
		lineHeight: 24,
	},
	infoContainer: {
		gap: 16,
	},
	infoItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	infoIcon: {
		fontSize: 20,
	},
	infoText: {
		flex: 1,
	},
	buttonContainer: {
		paddingHorizontal: 24,
	},
});
