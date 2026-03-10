import { useAuth } from '@/src/features/auth';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { UniversityName, getUnivLogo } from '@/src/shared/libs/univ';
import { Text } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export const BadgePreview = () => {
	const { t } = useTranslation();
	const { profileDetails } = useAuth();

	const name = profileDetails?.name || '';
	const university = profileDetails?.universityDetails?.name || '';
	const profileImage =
		profileDetails?.profileImages?.find((img) => img.isMain)?.imageUrl ||
		profileDetails?.profileImages?.find((img) => img.isMain)?.url ||
		null;

	const univName = university as UniversityName;
	const logoUrl = Object.values(UniversityName).includes(univName) ? getUnivLogo(univName) : null;

	console.log('[BadgePreview]', { name, university, profileImage, logoUrl, profileDetails: !!profileDetails });

	return (
		<View style={styles.container}>
			<Text size="xs" weight="medium" style={styles.label}>
				{t('apps.university-verification.badge_preview_label')}
			</Text>
			<View style={styles.card}>
				<View style={styles.profileRow}>
					{profileImage ? (
						<Image source={{ uri: profileImage }} style={styles.avatar} contentFit="cover" />
					) : (
						<View style={styles.avatarFallback}>
							<Text size="lg" weight="bold" style={{ color: semanticColors.brand.primary }}>
								{name.charAt(0)}
							</Text>
						</View>
					)}
					<View style={styles.infoWrap}>
						<View style={styles.nameRow}>
							<Text size="md" weight="bold" textColor="black">
								{name}
							</Text>
							{logoUrl && (
								<Image source={{ uri: logoUrl }} style={styles.univLogo} contentFit="contain" />
							)}
						</View>
						<Text size="xs" weight="normal" style={{ color: semanticColors.text.muted }}>
							{university}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 8,
	},
	label: {
		color: semanticColors.text.muted,
		textAlign: 'center',
	},
	card: {
		backgroundColor: semanticColors.surface.background,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: semanticColors.border.card,
		shadowColor: '#7A4AE2',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	avatarFallback: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: semanticColors.surface.secondary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	infoWrap: {
		flex: 1,
		gap: 2,
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	univLogo: {
		width: 20,
		height: 20,
		borderRadius: 10,
	},
});
