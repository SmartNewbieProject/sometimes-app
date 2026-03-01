/**
 * JP Identity Status Card - BentoGrid 내부에 표시되는 본인확인 상태 카드
 * 일본 유저만 보이며, 상태에 따라 다른 UI를 표시합니다.
 * BentoGrid의 다른 카드(contactBlockTile 등)와 동일한 흰색 카드 스타일을 사용합니다.
 */

import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { useJpIdentityStatus } from '../queries';

const BRAND = semanticColors.brand.primary;

const ShieldIcon = ({ color = BRAND }: { color?: string }) => (
	<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
		<Path
			d="M12 2L4 6V12C4 16.42 7.42 20.74 12 22C16.58 20.74 20 16.42 20 12V6L12 2Z"
			stroke={color}
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const ShieldCheckIcon = () => (
	<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
		<Path
			d="M12 2L4 6V12C4 16.42 7.42 20.74 12 22C16.58 20.74 20 16.42 20 12V6L12 2Z"
			stroke="#12B76A"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<Path
			d="M9 12L11 14L15 10"
			stroke="#12B76A"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const ShieldAlertIcon = () => (
	<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
		<Path
			d="M12 2L4 6V12C4 16.42 7.42 20.74 12 22C16.58 20.74 20 16.42 20 12V6L12 2Z"
			stroke="#FF3B30"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<Path d="M12 8V13" stroke="#FF3B30" strokeWidth={1.5} strokeLinecap="round" />
		<SvgCircle cx={12} cy={16} r={0.8} fill="#FF3B30" />
	</Svg>
);

const ChevronRight = ({
	color = semanticColors.text.muted,
	size = 8,
}: { color?: string; size?: number }) => (
	<Svg width={size} height={size * 1.5} viewBox="0 0 8 12" fill="none">
		<Path
			d="M1.5 1L6.5 6L1.5 11"
			stroke={color}
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

interface StatusConfig {
	icon: React.ReactNode;
	iconBg: string;
	titleKey: string;
	descriptionKey: string;
	actionable: boolean;
	badgeColor: string;
	badgeTextKey: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
	null: {
		icon: <ShieldIcon />,
		iconBg: '#F2EDFF',
		titleKey: 'features.jp-identity.card.not_verified.title',
		descriptionKey: 'features.jp-identity.card.not_verified.description',
		actionable: true,
		badgeColor: BRAND,
		badgeTextKey: 'features.jp-identity.card.badge.required',
	},
	PENDING: {
		icon: <ShieldIcon color="#A892D7" />,
		iconBg: '#F2EDFF',
		titleKey: 'features.jp-identity.card.pending.title',
		descriptionKey: 'features.jp-identity.card.pending.description',
		actionable: false,
		badgeColor: '#A892D7',
		badgeTextKey: 'features.jp-identity.card.badge.reviewing',
	},
	MANUAL_REVIEW: {
		icon: <ShieldIcon color="#A892D7" />,
		iconBg: '#F2EDFF',
		titleKey: 'features.jp-identity.card.manual_review.title',
		descriptionKey: 'features.jp-identity.card.manual_review.description',
		actionable: false,
		badgeColor: '#A892D7',
		badgeTextKey: 'features.jp-identity.card.badge.manual_review',
	},
	APPROVED: {
		icon: <ShieldCheckIcon />,
		iconBg: '#E8F8F0',
		titleKey: 'features.jp-identity.card.approved.title',
		descriptionKey: 'features.jp-identity.card.approved.description',
		actionable: false,
		badgeColor: '#12B76A',
		badgeTextKey: 'features.jp-identity.card.badge.verified',
	},
	REJECTED: {
		icon: <ShieldAlertIcon />,
		iconBg: '#FFF0F0',
		titleKey: 'features.jp-identity.card.rejected.title',
		descriptionKey: 'features.jp-identity.card.rejected.description',
		actionable: true,
		badgeColor: '#FF3B30',
		badgeTextKey: 'features.jp-identity.card.badge.rejected',
	},
};

const IdentityStatusCard = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { data, isLoading, error } = useJpIdentityStatus();

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="small" color={BRAND} />
			</View>
		);
	}

	const statusKey =
		error || !data ? 'null' : data.status === null ? 'null' : data.status;
	const config = STATUS_CONFIGS[statusKey] || STATUS_CONFIGS.null;

	const handlePress = () => {
		if (config.actionable) {
			router.push('/jp-identity' as never);
		}
	};

	return (
		<Pressable
			onPress={handlePress}
			disabled={!config.actionable}
			style={({ pressed }) => [
				styles.card,
				pressed && config.actionable && styles.cardPressed,
			]}
		>
			<View style={styles.cardLeft}>
				<View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
					{config.icon}
				</View>
				<View style={styles.textContainer}>
					<View style={styles.titleRow}>
						<Text style={styles.title} numberOfLines={1}>
							{t(config.titleKey)}
						</Text>
						<View
							style={[styles.badge, { backgroundColor: config.badgeColor }]}
						>
							<Text style={styles.badgeText}>{t(config.badgeTextKey)}</Text>
						</View>
					</View>
					<Text style={styles.description} numberOfLines={1}>
						{data?.status === 'REJECTED' && data.rejectionReason
							? data.rejectionReason
							: t(config.descriptionKey)}
					</Text>
				</View>
			</View>
			{config.actionable && <ChevronRight />}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		height: 64,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 16,
		padding: 16,
		backgroundColor: '#FFFFFF',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	cardPressed: {
		opacity: 0.8,
		transform: [{ scale: 0.98 }],
	},
	cardLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
	},
	iconCircle: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textContainer: {
		flex: 1,
		gap: 2,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	title: {
		fontSize: 14,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: '600',
		color: semanticColors.text.primary,
	},
	badge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 10,
	},
	badgeText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: '600',
	},
	description: {
		fontSize: 11,
		fontFamily: 'Pretendard-Regular',
		color: semanticColors.text.muted,
		lineHeight: 15,
	},
});

export default IdentityStatusCard;
