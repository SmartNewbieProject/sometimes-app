import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { BadgePreview } from '@/src/features/university-verification/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ImageResources } from '@/src/shared/libs';
import { Button, Header, PalePurpleGradient, Text } from '@/src/shared/ui';
import { ImageResource } from '@/src/shared/ui/image-resource';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle, Path } from 'react-native-svg';

const BRAND = semanticColors.brand.primary;

const ShieldHeroIcon = () => (
	<Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
		<Path
			d="M36 6L12 18V36C12 52.56 22.23 67.83 36 72C49.77 67.83 60 52.56 60 36V18L36 6Z"
			fill={BRAND}
		/>
		<Path
			d="M27 36L33 42L46.5 28.5"
			stroke="#FFFFFF"
			strokeWidth={4}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const AvatarStack = () => (
	<View style={styles.avatarStack}>
		{['#E9D5FF', '#C4B5FD', '#A78BFA'].map((color, i) => (
			<View
				key={color}
				style={[
					styles.stackAvatar,
					{ backgroundColor: color, marginLeft: i > 0 ? -10 : 0, zIndex: 3 - i },
				]}
			>
				<Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
					<SvgCircle cx={8} cy={5.5} r={2.5} fill={BRAND} opacity={0.6} />
					<Path
						d="M3.5 14C3.5 11.515 5.462 9.5 8 9.5C10.538 9.5 12.5 11.515 12.5 14"
						fill={BRAND}
						opacity={0.6}
					/>
				</Svg>
			</View>
		))}
	</View>
);

export default function LandingPage() {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.container}>
			<PalePurpleGradient />
			<Header.Container>
				<Header.LeftContent>
					<Pressable onPress={() => router.back()} style={styles.backButton}>
						<ChevronLeftIcon width={24} height={24} />
					</Pressable>
				</Header.LeftContent>
				<Header.CenterContent>
					<Text size="lg" weight="normal" textColor="black">
						{t('apps.university-verification.landing.header_title')}
					</Text>
				</Header.CenterContent>
				<Header.RightContent />
			</Header.Container>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero */}
				<View style={styles.heroSection}>
					<View style={styles.heroIconWrap}>
						<ShieldHeroIcon />
					</View>
					<Text size="22" weight="bold" textColor="black" style={styles.heroTitle}>
						{t('apps.university-verification.landing.hero_title')}
					</Text>
					<Text size="sm" weight="normal" style={styles.heroSubtitle}>
						{t('apps.university-verification.landing.hero_subtitle')}
					</Text>
				</View>

				{/* Benefits */}
				<View style={styles.benefitRow}>
					<View style={styles.benefitCard}>
						<Text size="22" weight="bold" style={{ color: BRAND }}>
							{t('apps.university-verification.landing.benefit_likes_value')}
						</Text>
						<Text size="xs" weight="normal" style={styles.benefitLabel}>
							{t('apps.university-verification.landing.benefit_likes')}
						</Text>
					</View>
					<View style={styles.benefitCard}>
						<Text size="22" weight="bold" style={{ color: BRAND }}>
							{t('apps.university-verification.landing.benefit_trust_value')}
						</Text>
						<Text size="xs" weight="normal" style={styles.benefitLabel}>
							{t('apps.university-verification.landing.benefit_trust')}
						</Text>
					</View>
					<View style={styles.benefitCard}>
						<View style={styles.gemRow}>
							<ImageResource resource={ImageResources.GEM} width={20} height={20} />
							<Text size="22" weight="bold" style={{ color: BRAND }}>
								5
							</Text>
						</View>
						<Text size="xs" weight="normal" style={styles.benefitLabel}>
							{t('apps.university-verification.landing.benefit_gems')}
						</Text>
					</View>
				</View>

				{/* Badge Preview */}
				<View style={styles.badgePreviewWrap}>
					<BadgePreview />
				</View>

				{/* Social Proof */}
				<View style={styles.socialProofRow}>
					<AvatarStack />
					<Text size="xs" weight="medium" style={styles.socialProofText}>
						{t('apps.university-verification.landing.social_proof', { count: '1,847' })}
					</Text>
				</View>
			</ScrollView>

			{/* CTA Button */}
			<View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
				<Button
					variant="primary"
					size="md"
					width="full"
					onPress={() => router.push('/university-verification/method')}
				>
					{t('apps.university-verification.landing.cta_button')}
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backButton: {
		padding: 8,
		marginLeft: -8,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
	},
	heroSection: {
		alignItems: 'center',
		marginTop: 24,
		gap: 12,
	},
	heroIconWrap: {
		width: 88,
		height: 88,
		borderRadius: 44,
		backgroundColor: 'rgba(122, 74, 226, 0.08)',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: BRAND,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 4,
	},
	heroTitle: {
		textAlign: 'center',
		lineHeight: 30,
	},
	heroSubtitle: {
		textAlign: 'center',
		color: semanticColors.text.muted,
		lineHeight: 20,
	},
	benefitRow: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 28,
	},
	benefitCard: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
		gap: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 3,
		elevation: 1,
	},
	benefitLabel: {
		color: semanticColors.text.muted,
	},
	gemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	badgePreviewWrap: {
		marginTop: 28,
	},
	socialProofRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginTop: 20,
	},
	avatarStack: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	stackAvatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	socialProofText: {
		color: semanticColors.text.muted,
	},
	ctaContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 20,
		paddingTop: 12,
		backgroundColor: 'rgba(255,255,255,0.95)',
	},
});
