import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { formatLastLogin, getSmartUnivLogoUrl } from '@/src/shared/libs';
import { Text } from '@/src/shared/ui';
import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ProfileMainImageProps } from './types';

export const ProfileMainImage = ({
	imageUrl,
	age,
	universityDetails,
	updatedAt,
	onPress,
	showLastLogin = true,
	country = 'kr',
}: ProfileMainImageProps) => {
	const { t } = useTranslation();

	const isVerified = universityDetails?.authentication ?? universityDetails?.isVerified ?? false;

	return (
		<View style={styles.container}>
			<Pressable onPress={onPress} style={styles.pressable} disabled={!onPress}>
				<Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
				<LinearGradient
					colors={['transparent', 'rgba(0,0,0,0.8)']}
					style={StyleSheet.absoluteFill}
					start={{ x: 0.5, y: 0.5 }}
					end={{ x: 0.5, y: 1 }}
				/>
			</Pressable>

			<View style={styles.profileOverlay} pointerEvents="none">
				{showLastLogin && updatedAt && (
					<View style={styles.lastLoginBadge}>
						<Text style={styles.lastLoginLabel}>{t('apps.partner.view.last_login_label')}</Text>
						<Text style={styles.lastLoginValue}>{formatLastLogin(updatedAt)}</Text>
					</View>
				)}
				<Text style={styles.ageText}>{t('apps.partner.view.age_format', { age })}</Text>
				<View style={styles.universityRow}>
					{universityDetails?.code && (
						<Image
							source={{
								uri: getSmartUnivLogoUrl(universityDetails.code, country),
							}}
							style={styles.universityLogo}
							contentFit="contain"
						/>
					)}
					<Text style={styles.universityName}>{universityDetails?.name}</Text>
				</View>
				<View style={styles.verificationRow}>
					<Feather name="check-square" size={16} color={semanticColors.brand.accent} />
					<Text style={styles.verificationText}>
						{isVerified
							? t('apps.partner.view.university_verified')
							: t('apps.partner.view.university_unverified')}
					</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		aspectRatio: 1,
		overflow: 'hidden',
	},
	pressable: {
		width: '100%',
		height: '100%',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	profileOverlay: {
		position: 'absolute',
		bottom: 32,
		left: 20,
		right: 20,
	},
	lastLoginBadge: {
		alignSelf: 'flex-start',
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: semanticColors.brand.primary,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		marginBottom: 8,
		gap: 4,
	},
	lastLoginLabel: {
		fontSize: 12,
		fontWeight: '700',
		color: semanticColors.text.inverse,
	},
	lastLoginValue: {
		fontSize: 12,
		fontWeight: '300',
		color: semanticColors.text.inverse,
	},
	ageText: {
		fontSize: 30,
		fontWeight: '700',
		color: semanticColors.text.inverse,
		marginBottom: 4,
	},
	universityRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	universityLogo: {
		width: 20,
		height: 20,
		marginRight: 6,
	},
	universityName: {
		fontSize: 16,
		color: semanticColors.text.inverse,
		opacity: 0.9,
	},
	verificationRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	verificationText: {
		fontSize: 14,
		color: semanticColors.brand.accent,
		marginLeft: 4,
	},
});
