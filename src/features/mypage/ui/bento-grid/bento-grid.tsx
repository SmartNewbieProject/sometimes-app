import FavoriteIcon from '@/assets/icons/favorite.svg';
import HeartIcon from '@/assets/icons/heart.svg';
import HelpIcon from '@/assets/icons/help.svg';
import ImproveProfileIcon from '@/assets/icons/improve-profile.svg';
import SettingIcon from '@/assets/icons/setting.svg';
import NotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import { useAuth } from '@/src/features/auth';
import { useContactBlockEnabled } from '@/src/features/contact-block/queries/use-contact-block-enabled';
import {
	getProfileId,
	getUniversityVerificationStatus,
} from '@/src/features/university-verification/apis';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ImageResources } from '@/src/shared/libs';
import { UniversityName, getUnivLogo } from '@/src/shared/libs/univ';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import { ImageResource } from '@/src/shared/ui/image-resource';
import { useCurrentGem } from '@features/payment/hooks';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { ToggleSettingsTile } from './toggle-settings-tile';

const GAP = 10;
const BRAND = semanticColors.brand.primary;
const REQUIRED_PHOTO_COUNT = 3;

// Inline SVG Icons
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

const PersonIcon = () => (
	<Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
		<SvgCircle cx={8} cy={5} r={2.5} stroke={BRAND} strokeWidth={1.3} />
		<Path
			d="M3 13.5C3 11.015 5.239 9 8 9C10.761 9 13 11.015 13 13.5"
			stroke={BRAND}
			strokeWidth={1.3}
			strokeLinecap="round"
		/>
	</Svg>
);

const PencilIcon = () => (
	<Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
		<Path
			d="M11.2 1.6L14.4 4.8L5.2 14H2V10.8L11.2 1.6Z"
			stroke={BRAND}
			strokeWidth={1.3}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const ChatBubbleIcon = () => (
	<Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
		<Path
			d="M2 3.5C2 2.672 2.672 2 3.5 2H12.5C13.328 2 14 2.672 14 3.5V10C14 10.828 13.328 11.5 12.5 11.5H10.18L8.47 13.21C8.21 13.47 7.79 13.47 7.53 13.21L5.82 11.5H3.5C2.672 11.5 2 10.828 2 10V3.5Z"
			stroke={BRAND}
			strokeWidth={1.2}
			strokeLinecap="round"
		/>
	</Svg>
);

const WarningIcon = () => (
	<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
		<Path
			d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
			fill="#F79009"
		/>
		<Path d="M12 9v4" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
		<SvgCircle cx={12} cy={16.5} r={1} fill="#fff" />
	</Svg>
);

const CheckCircleIcon = () => (
	<Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
		<SvgCircle cx={8} cy={8} r={7} fill="#12B76A" />
		<Path
			d="M5 8.5L7 10.5L11 6"
			stroke="#fff"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const LockIcon = () => (
	<Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
		<Path
			d="M5.5 10V7C5.5 4.515 7.515 2.5 10 2.5C12.485 2.5 14.5 4.515 14.5 7V10"
			stroke={BRAND}
			strokeWidth={1.3}
			strokeLinecap="round"
		/>
		<Path
			d="M15 13.5C15 16.538 12.761 19 10 19C7.239 19 5 16.538 5 13.5C5 10.462 7.239 8 10 8C12.761 8 15 10.462 15 13.5Z"
			stroke={BRAND}
			strokeWidth={1.3}
			strokeLinecap="round"
		/>
		<SvgCircle cx={10} cy={13.5} r={1.8} stroke={BRAND} strokeWidth={1.3} />
	</Svg>
);

export const BentoGrid = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const { profileDetails } = useAuth();
	const { data: gem } = useCurrentGem();
	const { data: contactBlockEnabled } = useContactBlockEnabled();

	// University verification
	const [isUniversityVerified, setIsUniversityVerified] = useState(false);
	const [isLoadingVerification, setIsLoadingVerification] = useState(true);

	useEffect(() => {
		const checkUniversityVerification = async () => {
			try {
				const profileId = await getProfileId();
				const verificationStatus = await getUniversityVerificationStatus(profileId);
				if (verificationStatus.verifiedAt) {
					const verifiedYear = new Date(verificationStatus.verifiedAt).getFullYear();
					const currentYear = new Date().getFullYear();
					setIsUniversityVerified(verifiedYear === currentYear);
				} else {
					setIsUniversityVerified(false);
				}
			} catch (_error) {
				setIsUniversityVerified(false);
			} finally {
				setIsLoadingVerification(false);
			}
		};
		checkUniversityVerification();
	}, []);

	// Profile data
	const formatStudentNumber = (studentNumber: string | null | undefined): string => {
		if (!studentNumber) return '';
		const prefix = studentNumber.substring(0, 2);
		return t('features.mypage.profile.student_number', { prefix });
	};

	const name = profileDetails?.name || '';
	const grade = formatStudentNumber(profileDetails?.universityDetails?.studentNumber);
	const university = profileDetails?.universityDetails?.name || '';
	const profileImage =
		profileDetails?.profileImages?.find((img) => img.isMain)?.imageUrl ||
		profileDetails?.profileImages?.find((img) => img.isMain)?.url ||
		require('@/assets/images/profile.png');

	const getUniversityLogoUrl = () => {
		if (isUniversityVerified && university) {
			const univName = university as UniversityName;
			if (Object.values(UniversityName).includes(univName)) {
				return getUnivLogo(univName);
			}
		}
		return null;
	};

	// Profile images for thumbnail preview
	const profileImages = profileDetails?.profileImages || [];
	const thumbnailImages = profileImages.slice(0, 3);
	const emptySlots = Array.from(
		{ length: REQUIRED_PHOTO_COUNT - profileImages.length },
		(_, i) => `slot-${profileImages.length + i}`,
	);

	return (
		<View style={styles.grid}>
			{/* Row 0: Photo tile */}
			<Pressable style={styles.photoTile} onPress={() => router.push('/my-profile-preview')}>
				<Image source={profileImage} style={StyleSheet.absoluteFillObject} contentFit="cover" />
				<LinearGradient
					colors={['transparent', 'rgba(0,0,0,0.55)']}
					style={StyleSheet.absoluteFillObject}
				/>
				{/* Gem badge */}
				<View style={styles.gemArea}>
					<Pressable style={styles.gemBadge} onPress={() => router.push('/purchase/gem-store')}>
						<ImageResource resource={ImageResources.GEM} width={24} height={24} />
						<Text style={styles.gemBadgeText}>{gem?.totalGem ?? 0}</Text>
					</Pressable>
					<Text style={styles.gemHint}>
						{t('features.mypage.bento.gem_remaining', { count: gem?.totalGem ?? 0 })}
					</Text>
				</View>
				<View style={styles.photoBottomInfo}>
					<View style={styles.photoNameRow}>
						<Text size="xl" weight="bold" textColor="white" style={{ lineHeight: 28 }}>
							{name}
						</Text>
						{!isLoadingVerification &&
							(() => {
								const logoUrl = getUniversityLogoUrl();
								return isUniversityVerified && logoUrl ? (
									<Image source={{ uri: logoUrl }} style={styles.univLogo} />
								) : (
									<Pressable onPress={() => router.push('/university-verification')}>
										<IconWrapper style={{ marginLeft: 6 }} size={16}>
											<NotSecuredIcon />
										</IconWrapper>
									</Pressable>
								);
							})()}
					</View>
					<Text style={styles.photoSubText}>
						{grade} · {university}
					</Text>
				</View>
				<Text style={styles.photoHint}>{t('features.mypage.bento.photo_hint')}</Text>
			</Pressable>

			{/* Row 1: 내 성향 + 이상형 설정 (2열) */}
			<View style={styles.row}>
				{/* 내 성향 */}
				<Pressable
					style={[styles.row1Tile, styles.whiteTile, styles.flex1]}
					onPress={() => router.push('/profile-edit/profile')}
				>
					<View style={styles.row1Header}>
						<IconWrapper size={20}>
							<ImproveProfileIcon />
						</IconWrapper>
						<Text size="sm" weight="semibold" textColor="black" numberOfLines={1}>
							{t('features.mypage.bento.my_tendency')}
						</Text>
					</View>
					<Text style={styles.row1Desc} numberOfLines={1}>
						{t('features.mypage.bento.my_tendency_desc')}
					</Text>
					<View style={styles.chevronWrap}>
						<ChevronRight />
					</View>
				</Pressable>

				{/* 이상형 설정 */}
				<Pressable
					style={[styles.row1Tile, styles.purpleTile, styles.flex1]}
					onPress={() => router.push('/profile-edit/interest')}
				>
					<View style={styles.row1Header}>
						<IconWrapper size={20}>
							<HeartIcon fill="#FFFFFF" stroke="none" />
						</IconWrapper>
						<Text size="sm" weight="semibold" style={{ color: '#FFFFFF' }} numberOfLines={1}>
							{t('features.mypage.bento.ideal_type')}
						</Text>
					</View>
					<Text style={[styles.row1Desc, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
						{t('features.mypage.bento.ideal_type_desc')}
					</Text>
					<View style={styles.chevronWrap}>
						<ChevronRight color="#FFFFFF" />
					</View>
				</Pressable>
			</View>

			{/* Row 2: 사진 관리 (비포/애프터 넛지 카드) */}
			{profileImages.length >= REQUIRED_PHOTO_COUNT ? (
				<Pressable
					style={styles.completeTile}
					onPress={() => router.push('/profile/photo-management?referrer=mypage')}
				>
					<View style={styles.completeLeft}>
						<CheckCircleIcon />
						<Text size="sm" weight="semibold" textColor="black">
							{t('features.mypage.bento.photo_mgmt')}
						</Text>
						<Text style={styles.completeBadge}>{t('features.mypage.bento.photo_complete')}</Text>
					</View>
					<View style={styles.completeRight}>
						{thumbnailImages.map((img, idx) => (
							<Image
								key={img.imageUrl || img.url || idx}
								source={{ uri: img.imageUrl || img.url }}
								style={[styles.completeThumb, idx > 0 && { marginLeft: -16 }]}
								contentFit="cover"
							/>
						))}
						<ChevronRight />
					</View>
				</Pressable>
			) : (
				<Pressable
					style={styles.nudgeTile}
					onPress={() => router.push('/profile/photo-management?referrer=mypage')}
				>
					<View style={styles.nudgeTop}>
						<WarningIcon />
						<Text style={styles.nudgeText}>{t('features.mypage.photo_nudge.description')}</Text>
					</View>
					<View style={styles.nudgeThumbRow}>
						{thumbnailImages.map((img, idx) => (
							<Image
								key={img.imageUrl || img.url || idx}
								source={{ uri: img.imageUrl || img.url }}
								style={[styles.nudgeThumb, idx > 0 && { marginLeft: -16 }]}
								contentFit="cover"
							/>
						))}
						{emptySlots.map((slotKey, i) => (
							<View
								key={slotKey}
								style={[
									styles.nudgeThumbEmpty,
									(profileImages.length > 0 || i > 0) && { marginLeft: -16 },
								]}
							>
								<Text style={styles.nudgeThumbQuestion}>?</Text>
							</View>
						))}
					</View>
					<View style={styles.nudgeCta}>
						<Text style={styles.nudgeCtaText}>{t('features.mypage.photo_nudge.cta')}</Text>
					</View>
				</Pressable>
			)}

			{/* Row 3: Toggle settings */}
			<ToggleSettingsTile />

			{/* Row 4: 계정 관리 + 1:1 문의하기 */}
			<View style={styles.row}>
				<Pressable
					style={[styles.row4Tile, styles.flex1]}
					onPress={() => router.push('/setting/account')}
				>
					<View style={styles.row4Header}>
						<View style={[styles.iconCircle, { backgroundColor: semanticColors.surface.surface }]}>
							<IconWrapper size={14}>
								<SettingIcon />
							</IconWrapper>
						</View>
						<Text style={styles.row4Label}>{t('features.mypage.bento.account')}</Text>
					</View>
					<Text style={styles.row4Desc}>{t('features.mypage.bento.account_desc')}</Text>
				</Pressable>
				<Pressable
					style={[styles.row4Tile, styles.flex1]}
					onPress={() => router.push('/support-chat' as never)}
				>
					<View style={styles.row4Header}>
						<View
							style={[styles.iconCircle, { backgroundColor: semanticColors.surface.secondary }]}
						>
							<IconWrapper size={14}>
								<HelpIcon />
							</IconWrapper>
						</View>
						<Text style={styles.row4Label}>{t('features.mypage.bento.support')}</Text>
					</View>
					<Text style={styles.row4Desc}>{t('features.mypage.bento.support_desc')}</Text>
				</Pressable>
			</View>

			{/* Row 5: My 활동 (4항목 아이콘 바) */}
			<Text style={styles.sectionTitle}>{t('features.mypage.my_activity.title')}</Text>
			<View style={styles.activityBar}>
				<Pressable style={styles.activityItem} onPress={() => router.push('/my-profile-preview')}>
					<PersonIcon />
					<Text style={styles.activityLabel}>{t('features.mypage.bento.preview')}</Text>
				</Pressable>
				<Pressable
					style={styles.activityItem}
					onPress={() => router.push('/community/my/my-articles')}
				>
					<PencilIcon />
					<Text style={styles.activityLabel}>{t('features.mypage.bento.articles')}</Text>
				</Pressable>
				<Pressable
					style={styles.activityItem}
					onPress={() => router.push('/community/my/my-comments')}
				>
					<ChatBubbleIcon />
					<Text style={styles.activityLabel}>{t('features.mypage.bento.comments')}</Text>
				</Pressable>
				<Pressable
					style={styles.activityItem}
					onPress={() => router.push('/community/my/my-liked')}
				>
					<IconWrapper size={16}>
						<FavoriteIcon />
					</IconWrapper>
					<Text style={styles.activityLabel}>{t('features.mypage.bento.likes')}</Text>
				</Pressable>
			</View>

			{/* Row 6: 연락처 차단 */}
			{contactBlockEnabled?.enabled && (
				<Pressable
					style={styles.contactBlockTile}
					onPress={() => router.push('/contact-block' as never)}
				>
					<View style={styles.contactBlockLeft}>
						<View
							style={[styles.iconCircle, { backgroundColor: semanticColors.surface.secondary }]}
						>
							<LockIcon />
						</View>
						<View style={styles.contactBlockText}>
							<Text size="sm" weight="bold" textColor="black">
								{t('features.mypage.bento.contact_block')}
							</Text>
							<Text style={styles.contactBlockDesc}>
								{t('features.mypage.bento.contact_block_desc')}
							</Text>
						</View>
					</View>
					<ChevronRight />
				</Pressable>
			)}
		</View>
	);
};

const cardShadow = {
	backgroundColor: '#FFFFFF',
	shadowColor: '#000',
	shadowOffset: { width: 0, height: 1 },
	shadowOpacity: 0.08,
	shadowRadius: 4,
	elevation: 2,
} as const;

const styles = StyleSheet.create({
	grid: {
		gap: GAP,
	},
	row: {
		flexDirection: 'row',
		gap: GAP,
	},
	flex1: {
		flex: 1,
	},
	// Photo tile (Row 0)
	photoTile: {
		height: 200,
		borderRadius: 18,
		overflow: 'hidden',
		justifyContent: 'flex-end',
	},
	gemArea: {
		position: 'absolute',
		top: 12,
		right: 12,
		alignItems: 'center',
		zIndex: 2,
		gap: 4,
	},
	gemBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 24,
		gap: 6,
	},
	gemBadgeText: {
		fontSize: 15,
		fontFamily: 'Pretendard-SemiBold',
		color: semanticColors.brand.deep,
	},
	photoBottomInfo: {
		padding: 14,
		paddingRight: 80,
	},
	photoNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	photoSubText: {
		fontSize: 13,
		color: '#FFFFFF',
		opacity: 0.7,
		marginTop: 2,
	},
	photoHint: {
		position: 'absolute',
		bottom: 14,
		right: 14,
		fontSize: 11,
		color: '#FFFFFF',
		opacity: 0.6,
		fontFamily: 'Pretendard-Regular',
	},
	gemHint: {
		fontSize: 11,
		color: '#FFFFFF',
		opacity: 0.7,
		fontFamily: 'Pretendard-Regular',
	},
	univLogo: {
		width: 16,
		height: 16,
		marginLeft: 6,
	},
	// Row 1: 내 성향 + 이상형 설정
	row1Tile: {
		height: 72,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 10,
		justifyContent: 'center',
	},
	row1Header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	row1Desc: {
		fontSize: 11,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
		marginTop: 4,
		paddingLeft: 26,
	},
	whiteTile: {
		...cardShadow,
	},
	purpleTile: {
		backgroundColor: semanticColors.brand.primary,
	},
	chevronWrap: {
		position: 'absolute',
		right: 10,
		top: 0,
		bottom: 0,
		justifyContent: 'center',
	},
	// Row 2: Photo nudge / complete
	nudgeTile: {
		borderRadius: 16,
		padding: 16,
		...cardShadow,
	},
	nudgeTop: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	nudgeText: {
		flex: 1,
		fontSize: 14,
		fontFamily: 'Pretendard-Bold',
		color: semanticColors.text.primary,
		lineHeight: 20,
	},
	nudgeThumbRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 14,
	},
	nudgeThumb: {
		width: 64,
		height: 64,
		borderRadius: 32,
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	nudgeThumbEmpty: {
		width: 64,
		height: 64,
		borderRadius: 32,
		borderWidth: 2,
		borderStyle: 'dashed',
		borderColor: '#D0D5DD',
		alignItems: 'center',
		justifyContent: 'center',
	},
	nudgeThumbQuestion: {
		fontSize: 14,
		color: '#D0D5DD',
		fontFamily: 'Pretendard-SemiBold',
	},
	nudgeCta: {
		backgroundColor: BRAND,
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 14,
	},
	nudgeCtaText: {
		fontSize: 13,
		color: '#FFFFFF',
		fontFamily: 'Pretendard-SemiBold',
	},
	completeTile: {
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 16,
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 12,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	completeLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	completeBadge: {
		fontSize: 10,
		color: '#12B76A',
		fontFamily: 'Pretendard-SemiBold',
	},
	completeRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	completeThumb: {
		width: 64,
		height: 64,
		borderRadius: 32,
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	// Row 4: Account + Support
	row4Tile: {
		borderRadius: 16,
		padding: 14,
		justifyContent: 'flex-start',
		gap: 6,
		...cardShadow,
	},
	row4Header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	row4Desc: {
		fontSize: 11,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
		lineHeight: 15,
	},
	iconCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	row4Label: {
		fontSize: 12,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-SemiBold',
	},
	// Row 5: My Activity bar
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Pretendard-SemiBold',
		color: semanticColors.text.primary,
		marginTop: 10,
	},
	activityBar: {
		flexDirection: 'row',
		borderRadius: 16,
		paddingVertical: 14,
		...cardShadow,
	},
	activityItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	activityLabel: {
		fontSize: 12,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Regular',
	},
	// Row 6: Contact block
	contactBlockTile: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 16,
		padding: 16,
		...cardShadow,
	},
	contactBlockLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
	},
	contactBlockText: {
		flex: 1,
		gap: 2,
	},
	contactBlockDesc: {
		fontSize: 11,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
		lineHeight: 15,
	},
});
