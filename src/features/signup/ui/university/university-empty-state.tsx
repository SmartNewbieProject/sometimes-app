import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface UniversityEmptyStateProps {
	keyword: string;
	onRegisterPress: () => void;
}

export function UniversityEmptyState({ keyword, onRegisterPress }: UniversityEmptyStateProps) {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.iconWrapper}>
				<Ionicons name="school-outline" size={36} color={semanticColors.text.muted} />
			</View>
			<Text style={styles.title}>{t('apps.auth.sign_up.university.empty_title')}</Text>
			<Text style={styles.description}>
				{t('apps.auth.sign_up.university.empty_desc', { keyword })}
			</Text>
			<Text style={styles.hint}>{t('apps.auth.sign_up.university.empty_hint')}</Text>
			<Pressable
				onPress={onRegisterPress}
				style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
			>
				<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
				<Text style={styles.ctaText}>{t('apps.auth.sign_up.university.register_cta')}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingVertical: 40,
		paddingHorizontal: 16,
	},
	iconWrapper: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: '#F5F0FF',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
	},
	title: {
		fontSize: 17,
		fontWeight: '600',
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-SemiBold',
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		color: semanticColors.text.secondary,
		fontFamily: 'Pretendard-Regular',
		textAlign: 'center',
		marginBottom: 4,
		lineHeight: 20,
	},
	hint: {
		fontSize: 13,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
		textAlign: 'center',
		marginBottom: 28,
		lineHeight: 19,
	},
	ctaButton: {
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 24,
		width: '100%',
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	ctaButtonPressed: {
		opacity: 0.85,
	},
	ctaText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
	},
});
