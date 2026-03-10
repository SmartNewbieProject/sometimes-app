import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Header, PalePurpleGradient, Text } from '@/src/shared/ui';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

const BRAND = semanticColors.brand.primary;

const IdCardIcon = () => (
	<Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
		<Rect x={4} y={7} width={24} height={18} rx={3} stroke={BRAND} strokeWidth={2} />
		<Path
			d="M12 16C13.657 16 15 14.657 15 13C15 11.343 13.657 10 12 10C10.343 10 9 11.343 9 13C9 14.657 10.343 16 12 16Z"
			stroke={BRAND}
			strokeWidth={1.5}
		/>
		<Path d="M18 12H24" stroke={BRAND} strokeWidth={1.5} strokeLinecap="round" />
		<Path d="M18 16H22" stroke={BRAND} strokeWidth={1.5} strokeLinecap="round" />
		<Path d="M9 21H23" stroke={BRAND} strokeWidth={1.5} strokeLinecap="round" />
	</Svg>
);

const EmailIcon = () => (
	<Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
		<Rect
			x={4}
			y={8}
			width={24}
			height={16}
			rx={3}
			stroke={semanticColors.text.muted}
			strokeWidth={2}
		/>
		<Path
			d="M4 11L16 19L28 11"
			stroke={semanticColors.text.muted}
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const CheckIcon = () => (
	<Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
		<Path
			d="M3 7L6 10L11 4"
			stroke="#12B76A"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const CrossIcon = () => (
	<Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
		<Path d="M4 4L10 10M10 4L4 10" stroke="#F04438" strokeWidth={2} strokeLinecap="round" />
	</Svg>
);

const Chip = ({ text }: { text: string }) => (
	<View style={styles.chip}>
		<Text size="xs" weight="medium" style={{ color: semanticColors.text.tertiary }}>
			{text}
		</Text>
	</View>
);

export default function MethodPage() {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	const handleDmLink = () => {
		Linking.openURL('https://www.instagram.com/sometime.in.univ/');
	};

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
						{t('apps.university-verification.method.header_title')}
					</Text>
				</Header.CenterContent>
				<Header.RightContent />
			</Header.Container>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
				showsVerticalScrollIndicator={false}
			>
				{/* Heading */}
				<Text size="20" weight="bold" textColor="black" style={styles.heading}>
					{t('apps.university-verification.method.heading')}
				</Text>
				<Text size="sm" weight="normal" style={styles.headingSub}>
					{t('apps.university-verification.method.heading_sub')}
				</Text>

				{/* 학생증 카드 (추천) */}
				<Pressable
					style={[styles.methodCard, styles.methodCardRecommended]}
					onPress={() => router.push('/university-verification/idcard')}
				>
					<View style={styles.methodCardHeader}>
						<IdCardIcon />
						<View style={styles.recommendedBadge}>
							<Text size="xs" weight="bold" style={{ color: '#FFFFFF' }}>
								{t('apps.university-verification.method.recommended')}
							</Text>
						</View>
					</View>
					<Text size="md" weight="bold" textColor="black" style={styles.methodTitle}>
						{t('apps.university-verification.method.idcard_title')}
					</Text>
					<Text size="xs" weight="normal" style={styles.methodDesc}>
						{t('apps.university-verification.method.idcard_desc')}
					</Text>
					<View style={styles.chipRow}>
						<Chip text={t('apps.university-verification.method.idcard_chip_photo')} />
						<Chip text={t('apps.university-verification.method.idcard_chip_time')} />
					</View>
				</Pressable>

				{/* 이메일 카드 */}
				<Pressable
					style={styles.methodCard}
					onPress={() => router.push('/university-verification')}
				>
					<View style={styles.methodCardHeader}>
						<EmailIcon />
					</View>
					<Text size="md" weight="bold" textColor="black" style={styles.methodTitle}>
						{t('apps.university-verification.method.email_title')}
					</Text>
					<Text size="xs" weight="normal" style={styles.methodDesc}>
						{t('apps.university-verification.method.email_desc')}
					</Text>
					<View style={styles.chipRow}>
						<Chip text={t('apps.university-verification.method.email_chip_need')} />
						<Chip text={t('apps.university-verification.method.email_chip_time')} />
					</View>
				</Pressable>

				{/* 비교표 */}
				<View style={styles.compareContainer}>
					<Text size="sm" weight="semibold" textColor="black" style={styles.compareTitle}>
						{t('apps.university-verification.method.compare_title')}
					</Text>
					<View style={styles.compareTable}>
						{/* Header */}
						<View style={styles.compareRow}>
							<View style={styles.compareLabelCell} />
							<View style={styles.compareCell}>
								<Text size="xs" weight="semibold" style={{ color: BRAND }}>
									{t('apps.university-verification.method.idcard_title')}
								</Text>
							</View>
							<View style={styles.compareCell}>
								<Text size="xs" weight="semibold" style={{ color: semanticColors.text.tertiary }}>
									{t('apps.university-verification.method.email_title')}
								</Text>
							</View>
						</View>
						{/* 소요시간 */}
						<View style={[styles.compareRow, styles.compareRowAlt]}>
							<View style={styles.compareLabelCell}>
								<Text size="xs" weight="medium" textColor="black">
									{t('apps.university-verification.method.compare_time')}
								</Text>
							</View>
							<View style={styles.compareCell}>
								<Text size="xs" weight="normal" style={{ color: semanticColors.text.tertiary }}>
									{t('apps.university-verification.method.compare_time_idcard')}
								</Text>
							</View>
							<View style={styles.compareCell}>
								<Text size="xs" weight="normal" style={{ color: semanticColors.text.tertiary }}>
									{t('apps.university-verification.method.compare_time_email')}
								</Text>
							</View>
						</View>
						{/* 필요한 것 */}
						<View style={styles.compareRow}>
							<View style={styles.compareLabelCell}>
								<Text size="xs" weight="medium" textColor="black">
									{t('apps.university-verification.method.compare_need')}
								</Text>
							</View>
							<View style={styles.compareCell}>
								<Text size="xs" weight="normal" style={{ color: semanticColors.text.tertiary }}>
									{t('apps.university-verification.method.compare_need_idcard')}
								</Text>
							</View>
							<View style={styles.compareCell}>
								<Text size="xs" weight="normal" style={{ color: semanticColors.text.tertiary }}>
									{t('apps.university-verification.method.compare_need_email')}
								</Text>
							</View>
						</View>
						{/* 학교 메일 없어도 */}
						<View style={[styles.compareRow, styles.compareRowAlt]}>
							<View style={styles.compareLabelCell}>
								<Text size="xs" weight="medium" textColor="black">
									{t('apps.university-verification.method.compare_no_email')}
								</Text>
							</View>
							<View style={styles.compareCell}>
								<CheckIcon />
								<Text size="xs" weight="medium" style={{ color: '#12B76A' }}>
									{t('apps.university-verification.method.compare_possible')}
								</Text>
							</View>
							<View style={styles.compareCell}>
								<CrossIcon />
								<Text size="xs" weight="medium" style={{ color: '#F04438' }}>
									{t('apps.university-verification.method.compare_impossible')}
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* DM 문의 */}
				<View style={styles.dmSection}>
					<Text size="xs" weight="normal" style={styles.dmText}>
						{t('apps.university-verification.method.dm_help')}
					</Text>
					<Pressable onPress={handleDmLink}>
						<Text size="xs" weight="semibold" style={{ color: BRAND }}>
							{t('apps.university-verification.method.dm_link')}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
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
	heading: {
		marginTop: 20,
	},
	headingSub: {
		color: semanticColors.text.muted,
		marginTop: 4,
		marginBottom: 20,
	},
	methodCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 18,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: semanticColors.border.card,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 3,
		elevation: 1,
	},
	methodCardRecommended: {
		borderColor: semanticColors.brand.primary,
		borderWidth: 1.5,
	},
	methodCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	recommendedBadge: {
		backgroundColor: semanticColors.brand.primary,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
	},
	methodTitle: {
		marginBottom: 4,
	},
	methodDesc: {
		color: semanticColors.text.muted,
		lineHeight: 18,
	},
	chipRow: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 12,
	},
	chip: {
		backgroundColor: semanticColors.surface.secondary,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 8,
	},
	compareContainer: {
		marginTop: 12,
		gap: 12,
	},
	compareTitle: {
		marginBottom: 4,
	},
	compareTable: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: semanticColors.border.card,
	},
	compareRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	compareRowAlt: {
		backgroundColor: semanticColors.surface.surface,
	},
	compareLabelCell: {
		flex: 1.2,
	},
	compareCell: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
	},
	dmSection: {
		alignItems: 'center',
		marginTop: 24,
		gap: 6,
	},
	dmText: {
		color: semanticColors.text.muted,
	},
});
