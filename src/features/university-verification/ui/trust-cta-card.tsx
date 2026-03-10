import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ImageResources } from '@/src/shared/libs';
import { Text } from '@/src/shared/ui';
import { ImageResource } from '@/src/shared/ui/image-resource';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ShieldIcon = () => (
	<Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<Path
			d="M12 2L4 6V12C4 17.52 7.41 22.69 12 24C16.59 22.69 20 17.52 20 12V6L12 2Z"
			fill={semanticColors.brand.primary}
		/>
		<Path
			d="M9 12L11 14L15.5 9.5"
			stroke="#FFFFFF"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

export const TrustCtaCard = () => {
	const { t } = useTranslation();
	const router = useRouter();

	return (
		<Pressable
			style={styles.container}
			onPress={() => router.push('/university-verification/landing')}
		>
			<View style={styles.topRow}>
				<View style={styles.iconWrap}>
					<ShieldIcon />
				</View>
				<View style={styles.textWrap}>
					<Text size="sm" weight="bold" textColor="black" numberOfLines={1}>
						{t('apps.university-verification.cta.title')}
					</Text>
					<Text size="xs" weight="normal" style={styles.subtitle} numberOfLines={1}>
						{t('apps.university-verification.cta.subtitle')}
					</Text>
				</View>
				<View style={styles.gemBadge}>
					<ImageResource resource={ImageResources.GEM} width={16} height={16} />
					<Text size="xs" weight="bold" style={styles.gemText}>
						+5
					</Text>
				</View>
			</View>

			<View style={styles.bottomRow}>
				<View style={styles.progressTrack}>
					<View style={styles.progressBar} />
				</View>
				<Text size="xs" weight="normal" style={styles.socialProof} numberOfLines={1}>
					{t('apps.university-verification.cta.social_proof', { count: '1,847' })}
				</Text>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 14,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
		borderColor: semanticColors.brand.primaryLight,
		gap: 10,
	},
	topRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	iconWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: semanticColors.surface.secondary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textWrap: {
		flex: 1,
		gap: 1,
	},
	subtitle: {
		color: semanticColors.text.muted,
	},
	gemBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		backgroundColor: semanticColors.surface.secondary,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 10,
	},
	gemText: {
		color: semanticColors.brand.primary,
	},
	bottomRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	progressTrack: {
		flex: 1,
		height: 4,
		backgroundColor: semanticColors.surface.disabled,
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressBar: {
		width: '70%',
		height: 4,
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 2,
	},
	socialProof: {
		color: semanticColors.text.muted,
	},
});
