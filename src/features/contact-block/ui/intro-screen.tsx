import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
import { Ionicons } from '@expo/vector-icons';

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
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<Image
							source={require('@/src/assets/images/contact-block/shield_lock.png')}
							style={styles.shieldIcon}
							resizeMode="contain"
						/>
						<Text size="md" weight="bold" textColor="black">
							안전한 매칭을 위한 지인 차단
						</Text>
					</View>

					<Text size="sm" textColor="gray" style={styles.cardDescription}>
						연락처를 업로드하면 지인들에게 내 프로필이 노출되지 않고, 지인의 프로필도 보이지 않습니다.
					</Text>

					<Image
						source={require('@/src/assets/images/contact-block/fox_phone.png')}
						style={styles.foxImage}
						resizeMode="contain"
					/>

					<Button
						variant="primary"
						size="lg"
						width="full"
						onPress={onRequestContacts}
						disabled={isLoading}
					>
						{isLoading ? t('ui.확인_중') : '연락처 업로드'}
					</Button>
				</View>

				<View style={styles.benefitContainer}>
					<View style={styles.benefitItem}>
						<Ionicons name="checkmark" size={16} color={colors.primaryPurple} />
						<Text size="sm" textColor="gray">
							업로드된 연락처는 매칭 목적으로만 사용
						</Text>
					</View>
					<View style={styles.benefitItem}>
						<Ionicons name="checkmark" size={16} color={colors.primaryPurple} />
						<Text size="sm" textColor="gray">
							개인정보는 암호화되어 안전하게 보관
						</Text>
					</View>
					<View style={styles.benefitItem}>
						<Ionicons name="checkmark" size={16} color={colors.primaryPurple} />
						<Text size="sm" textColor="gray">
							언제든지 설정을 변경할 수 있음
						</Text>
					</View>
				</View>

				<View style={styles.manageContainer}>
					<Text size="lg" weight="bold" textColor="black" style={styles.manageTitle}>
						연락처 관리
					</Text>
					<View style={styles.divider} />
					<TouchableOpacity
						style={styles.manageItem}
						onPress={() => router.push('/contact-block/management')}
					>
						<Text size="md" textColor="black">
							차단된 연락처
						</Text>
						<Ionicons name="chevron-forward" size={20} color={colors.lightGray} />
					</TouchableOpacity>
				</View>
			</ScrollView>
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
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
	},
	card: {
		backgroundColor: semanticColors.surface.background,
		borderRadius: 20,
		padding: 24,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		borderWidth: 1,
		borderColor: '#F0F0F0',
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		gap: 8,
	},
	shieldIcon: {
		width: 24,
		height: 24,
	},
	cardDescription: {
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 24,
		paddingHorizontal: 10,
	},
	foxImage: {
		width: 200,
		height: 180,
		marginBottom: 24,
	},
	benefitContainer: {
		marginTop: 24,
		gap: 12,
		paddingHorizontal: 12,
	},
	benefitItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	manageContainer: {
		marginTop: 40,
	},
	manageTitle: {
		marginBottom: 12,
	},
	divider: {
		height: 1,
		backgroundColor: semanticColors.border.smooth,
		marginBottom: 0,
	},
	manageItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
	},
});
