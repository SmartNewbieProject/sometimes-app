import useLiked from '@/src/features/like/hooks/use-liked';
import { LikeButton } from '@/src/features/like/ui/like-button';
import {
	ILikedRejectedButton,
	InChatButton,
	LikedMeOpenButton,
} from '@/src/features/post-box/ui/post-box-card';
import PhotoSlider from '@/src/widgets/slide/photo-slider';
import Loading from '@features/loading';
import Match, { MatchContext, MihoMessage } from '@features/match';
import MatchReasons from '@/src/features/match-reasons';
import MatchingAnalysis from '@/src/features/match-reasons/ui/matching-analysis';
import {
	MihoIntroModal,
	PartnerBasicInfo,
	PartnerMBTI,
	PartnerIdealType,
	MatchingReasonCard,
} from '@/src/features/match/ui';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useGlobalLoading } from '@/src/shared/hooks/use-global-loading';
import { BlurredPhotoCard } from '@/src/widgets/blurred-photo-card';
import { cn, formatLastLogin, getSmartUnivLogoUrl, parser } from '@/src/shared/libs';
import Feather from '@expo/vector-icons/Feather';
import { Button, Show, Text, HeaderWithNotification } from '@shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { Href } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View, Text as RNText } from 'react-native';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

const { queries } = Match;
const { useMatchPartnerQuery } = queries;
const { useMatchReasonsQuery } = MatchReasons.queries;

export default function PartnerDetailScreen() {
	const { t, i18n } = useTranslation();
	const country = i18n.language?.startsWith('ja') ? 'jp' : 'kr';
	const { id: matchId, redirectTo } = useLocalSearchParams<{ id: string; redirectTo?: string }>();

	const handleBack = () => {
		if (redirectTo) {
			router.replace(decodeURIComponent(redirectTo) as Href);
		} else {
			router.replace('/matching-history');
		}
	};
	const { data: partner, isLoading } = useMatchPartnerQuery(matchId);
	const { data: matchReasonsData } = useMatchReasonsQuery(partner?.connectionId);
	const { profileDetails } = useAuth();
	const { disableGlobalLoading, enableGlobalLoading } = useGlobalLoading();
	const [isZoomVisible, setZoomVisible] = useState(false);
	const { isStatus, isLiked, isExpired } = useLiked();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showMihoIntro, setShowMihoIntro] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(true);
	const hasTrackedView = useRef(false);

	// 온보딩 로딩 중에는 전역 로딩 오버레이 비활성화
	useEffect(() => {
		if (isAnalyzing) {
			disableGlobalLoading();
		} else {
			enableGlobalLoading();
		}

		return () => {
			enableGlobalLoading();
		};
	}, [isAnalyzing, disableGlobalLoading, enableGlobalLoading]);

	// 내 승인된 사진 개수 계산
	const myApprovedPhotosCount =
		profileDetails?.profileImages?.filter((img) => img.reviewStatus?.toUpperCase() === 'APPROVED')
			.length ?? 0;

	// 미호 멘트를 위한 매칭 컨텍스트
	const matchContext: MatchContext = useMemo(() => {
		const myUniversity = profileDetails?.universityDetails?.name;
		const partnerUniversity = partner?.universityDetails?.name;
		const sameUniversity = !!(
			myUniversity &&
			partnerUniversity &&
			myUniversity === partnerUniversity
		);

		return {
			matchScore: partner?.matchScore ?? 50,
			sameUniversity,
			isFirstMatch: partner?.isFirstMatch ?? false,
			commonPoints:
				matchReasonsData?.reasons?.map((r) => r.category).filter((c): c is string => !!c) ?? [],
		};
	}, [partner, profileDetails, matchReasonsData]);

	useEffect(() => {
		if (!partner) return;

		// 재방문 (isFirstView: false) - 애니메이션/모달 스킵
		if (partner.isFirstView === false) {
			setIsAnalyzing(false);
			setShowMihoIntro(false);

			// Mixpanel 트래킹만 실행
			if (!hasTrackedView.current) {
				hasTrackedView.current = true;
				mixpanelAdapter.track(MIXPANEL_EVENTS.PROFILE_VIEWED, {
					viewed_profile_id: partner.id,
					view_source: 'matching_history',
					partner_age: partner.age,
					partner_university: partner.universityDetails?.name,
					timestamp: new Date().toISOString(),
				});
			}
			return;
		}

		// 최초 방문 (isFirstView: true 또는 undefined) - 애니메이션 + 모달 표시
		const timer = setTimeout(() => {
			setIsAnalyzing(false);
			setShowMihoIntro(true);

			if (!hasTrackedView.current) {
				hasTrackedView.current = true;
				mixpanelAdapter.track(MIXPANEL_EVENTS.PROFILE_VIEWED, {
					viewed_profile_id: partner.id,
					view_source: 'matching_history',
					partner_age: partner.age,
					partner_university: partner.universityDetails?.name,
					timestamp: new Date().toISOString(),
				});
			}
		}, 4000);

		return () => clearTimeout(timer);
	}, [partner]);

	const onZoomClose = () => {
		setZoomVisible(false);
	};

	const handleMihoIntroClose = () => {
		setShowMihoIntro(false);
	};

	const handleMihoMessageShown = useCallback(
		(message: MihoMessage) => {
			mixpanelAdapter.track(MIXPANEL_EVENTS.MIHO_MESSAGE_SHOWN, {
				message_id: message.id,
				message_rarity: message.rarity,
				message_title: message.title,
				message_tone: message.tone,
				is_special: message.special ?? false,
				partner_id: partner?.id,
				match_score: partner?.matchScore ?? 50,
				same_university: matchContext.sameUniversity,
				timestamp: new Date().toISOString(),
			});
		},
		[partner?.id, partner?.matchScore, matchContext.sameUniversity],
	);

	const userWithdrawal = !!partner?.deletedAt;

	if (isLoading || !partner) {
		return <Loading.Page title={t('apps.partner.view.loading')} />;
	}

	const characteristicsOptions = parser.getMultipleCharacteristicsOptions(
		['PERSONALITY', 'DATING_STYLE', 'INTEREST'],
		partner.characteristics,
	);

	const personal = characteristicsOptions['PERSONALITY'];
	const loveStyles = characteristicsOptions['DATING_STYLE'];

	const mainProfileImageUrl =
		partner.profileImages.find((img) => img.isMain)?.imageUrl ||
		partner.profileImages.find((img) => img.isMain)?.url ||
		partner.profileImages[0]?.imageUrl ||
		partner.profileImages[0]?.url;

	// 유효한 이미지만 필터링 (imageUrl 또는 url이 있는 것만)
	const validProfileImages = partner.profileImages.filter((img) => img.imageUrl || img.url);

	const renderBottomButtons = () => {
		return (
			<View
				style={{
					marginBottom: 36,
					height: 48,
					marginTop: 6,
					marginLeft: 16,
					marginRight: 16,
				}}
			>
				<Show
					when={
						isStatus(partner?.connectionId ?? '') === 'OPEN' &&
						isStatus(partner?.connectionId ?? '') !== 'IN_CHAT'
					}
				>
					<View style={{ width: '100%', flex: 1, flexDirection: 'row', height: 48 }}>
						<LikedMeOpenButton
							height={48}
							matchId={matchId}
							likeId={partner?.matchLikeId ?? undefined}
						/>
					</View>
				</Show>

				<Show
					when={
						!(isStatus(partner?.connectionId ?? '') === 'OPEN') &&
						!isLiked(partner?.connectionId ?? '') &&
						!!partner?.connectionId &&
						!(isStatus(partner?.connectionId ?? '') === 'IN_CHAT')
					}
				>
					<View
						style={{
							width: '100%',
							flex: 1,
							flexDirection: 'row',
							height: 48,
						}}
					>
						<LikeButton
							connectionId={partner.connectionId ?? ''}
							matchId={matchId ?? ''}
							nickname={partner.name ?? ''}
							profileUrl={mainProfileImageUrl ?? ''}
							canLetter={partner.canLetter}
							source="profile"
						/>
					</View>
				</Show>
				<Show
					when={
						!isExpired(partner?.connectionId ?? '') &&
						isStatus(partner?.connectionId ?? '') === 'PENDING'
					}
				>
					<View style={{ width: '100%', flex: 1, flexDirection: 'row', height: 48 }}>
						<Button
							variant="outline"
							disabled={true}
							size="md"
							styles={{ flex: 1, alignItems: 'center', height: 48 }}
						>
							<Text>{t('apps.partner.view.button_waiting')}</Text>
						</Button>
					</View>
				</Show>
				<Show
					when={
						(isExpired(partner?.connectionId ?? '') ||
							isStatus(partner?.connectionId ?? '') === 'REJECTED' ||
							userWithdrawal) &&
						isStatus(partner?.connectionId ?? '') !== 'IN_CHAT'
					}
				>
					<ILikedRejectedButton height={48} connectionId={partner?.connectionId ?? ''} />
				</Show>
				<Show when={isStatus(partner?.connectionId ?? '') === 'IN_CHAT'}>
					<InChatButton height={48} />
				</Show>
			</View>
		);
	};

	return (
		<View style={styles.mainContainer}>
			<MihoIntroModal
				visible={showMihoIntro}
				onClose={handleMihoIntroClose}
				matchContext={matchContext}
				onMessageShown={handleMihoMessageShown}
			/>

			<PhotoSlider
				images={validProfileImages.map((item) => item.imageUrl || item.url) ?? []}
				onClose={onZoomClose}
				initialIndex={selectedIndex}
				visible={isZoomVisible}
			/>

			<HeaderWithNotification
				backButtonAction={handleBack}
				rightContent={
					<Pressable
						onPress={() =>
							router.navigate({
								pathname: '/partner/ban-report',
								params: {
									partnerId: partner.id,
									partnerName: partner.name,
									partnerAge: partner.age,
									partnerUniv: partner.universityDetails?.name,
									partnerProfileImage: mainProfileImageUrl,
								},
							})
						}
						className="pt-2 -mr-2"
					>
						<Feather name="alert-triangle" size={24} color={semanticColors.text.primary} />
					</Pressable>
				}
			/>

			{isAnalyzing ? (
				<View style={styles.analyzingContainer}>
					<MatchingAnalysis imageUrl={mainProfileImageUrl} />
				</View>
			) : (
				<>
					<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
						{validProfileImages.length > 0 && (
							<View
								style={{
									width: '100%',
									aspectRatio: 1,
									overflow: 'hidden',
								}}
							>
								<Pressable
									onPress={() => {
										setSelectedIndex(0);
										setZoomVisible(true);
									}}
									className="w-full h-full"
									style={{ width: '100%', height: '100%' }}
								>
									<Image
										source={{ uri: validProfileImages[0].imageUrl || validProfileImages[0].url }}
										style={{ width: '100%', height: '100%' }}
										contentFit="cover"
									/>
									<LinearGradient
										colors={['transparent', 'rgba(0,0,0,0.8)']}
										style={StyleSheet.absoluteFill}
										start={{ x: 0.5, y: 0.5 }}
										end={{ x: 0.5, y: 1 }}
									/>
								</Pressable>

								<View style={styles.profileOverlay} pointerEvents="none">
									<View style={styles.lastLoginBadge}>
										<Text style={styles.lastLoginLabel}>
											{t('apps.partner.view.last_login_label')}
										</Text>
										<Text style={styles.lastLoginValue}>{formatLastLogin(partner.updatedAt)}</Text>
									</View>
									<Text style={styles.ageText}>
										{t('apps.partner.view.age_format', { age: partner.age })}
									</Text>
									<View style={styles.universityRow}>
										{partner.universityDetails?.code && (
											<Image
												source={{
													uri: getSmartUnivLogoUrl(partner.universityDetails.code, country),
												}}
												style={styles.universityLogo}
												contentFit="contain"
											/>
										)}
										<Text style={styles.universityName}>{partner.universityDetails?.name}</Text>
									</View>
									<View style={styles.verificationRow}>
										<Feather name="check-square" size={16} color={semanticColors.brand.accent} />
										<Text style={styles.verificationText}>
											{partner.universityDetails?.authentication
												? t('apps.partner.view.university_verified')
												: t('apps.partner.view.university_unverified')}
										</Text>
									</View>
								</View>
							</View>
						)}

						<PartnerBasicInfo partner={partner} />

						{validProfileImages.length > 1 && (
							<View
								style={{
									width: '100%',
									aspectRatio: 1,
									marginBottom: 32,
									overflow: 'hidden',
								}}
							>
								{myApprovedPhotosCount >= 2 ? (
									<Pressable
										onPress={() => {
											setSelectedIndex(1);
											setZoomVisible(true);
										}}
										style={{
											width: '100%',
											height: '100%',
											borderRadius: 32,
											overflow: 'hidden',
										}}
									>
										<Image
											source={{ uri: validProfileImages[1].imageUrl || validProfileImages[1].url }}
											style={{ width: '100%', height: '100%' }}
											contentFit="cover"
										/>
									</Pressable>
								) : (
									<BlurredPhotoCard
										skippedPhotoCount={validProfileImages.length - 1}
										showCTA={true}
										size="full"
										sampleImageUrl={validProfileImages[1].imageUrl || validProfileImages[1].url}
									/>
								)}
							</View>
						)}

						<PartnerMBTI partner={partner} />

						<PartnerIdealType partner={partner} />

						<Text
							style={{
								color: semanticColors.text.primary,
								fontSize: 22,
								fontWeight: 'bold',
								paddingHorizontal: 20,
								marginBottom: 4,
							}}
						>
							{t('apps.partner.view.matching_reason_title')}
						</Text>

						{matchReasonsData?.reasons &&
							matchReasonsData.reasons.length > 0 &&
							(() => {
								// Helper: characteristics를 번역
								const translateCharacteristics = (
									categoryKey: string,
									fallbackKey: string,
								): string[] => {
									// 영어 키 우선, 없으면 한글 키 fallback
									const items =
										parser.getMultipleCharacteristicsOptions(
											[categoryKey],
											partner.characteristics,
										)[categoryKey] ||
										parser.getMultipleCharacteristicsOptions(
											[fallbackKey],
											partner.characteristics,
										)[fallbackKey];

									return (
										items?.map((c: any) => {
											// 서버에서 key 제공하면 i18n 사용, 아니면 label 그대로
											if (c.key) {
												return t(`apps.partner.characteristics.${c.key.toLowerCase()}`);
											}
											return c.label;
										}) || []
									);
								};

								return (
									<MatchingReasonCard
										reasons={matchReasonsData.reasons.map((r) => r.description)}
										keywords={[
											...translateCharacteristics('PERSONALITY', '성격'),
											...translateCharacteristics('DATING_STYLE', '연애 스타일'),
											...translateCharacteristics('INTEREST', '관심사'),
										]}
									/>
								);
							})()}

						{validProfileImages.length > 2 && (
							<View
								style={{
									width: '100%',
									aspectRatio: 1,
									marginBottom: 32,
									overflow: 'hidden',
								}}
							>
								{myApprovedPhotosCount >= 3 ? (
									<Pressable
										onPress={() => {
											setSelectedIndex(2);
											setZoomVisible(true);
										}}
										style={{
											width: '100%',
											height: '100%',
											borderRadius: 32,
											overflow: 'hidden',
										}}
									>
										<Image
											source={{ uri: validProfileImages[2].imageUrl || validProfileImages[2].url }}
											style={{ width: '100%', height: '100%' }}
											contentFit="cover"
										/>
									</Pressable>
								) : (
									<BlurredPhotoCard
										skippedPhotoCount={validProfileImages.length - myApprovedPhotosCount}
										showCTA={true}
										size="full"
										sampleImageUrl={validProfileImages[2].imageUrl || validProfileImages[2].url}
									/>
								)}
							</View>
						)}

						{validProfileImages.length > 3 && (
							<View className="pb-10">
								{validProfileImages.slice(3).map((item, index) => {
									const requiredPhotoCount = index + 4;
									const hasEnoughPhotos = myApprovedPhotosCount >= requiredPhotoCount;

									return (
										<View
											key={item.id}
											style={{
												width: '100%',
												aspectRatio: 1,
												marginBottom: 16,
												overflow: 'hidden',
											}}
										>
											{hasEnoughPhotos ? (
												<Pressable
													onPress={() => {
														setSelectedIndex(index + 3);
														setZoomVisible(true);
													}}
													style={{
														width: '100%',
														height: '100%',
														borderRadius: 32,
														overflow: 'hidden',
													}}
												>
													<Image
														source={{ uri: item.imageUrl || item.url }}
														style={{ width: '100%', height: '100%' }}
														contentFit="cover"
													/>
												</Pressable>
											) : (
												<BlurredPhotoCard
													skippedPhotoCount={validProfileImages.length - myApprovedPhotosCount}
													showCTA={true}
													size="full"
													sampleImageUrl={item.imageUrl || item.url}
												/>
											)}
										</View>
									);
								})}
							</View>
						)}
					</ScrollView>

					{/* Bottom Action Bar */}
					{renderBottomButtons()}
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	analyzingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollView: {
		flex: 1,
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
	sectionContainer: {
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: semanticColors.text.primary,
		marginBottom: 12,
		lineHeight: 26,
	},
	sectionContent: {
		fontSize: 15,
		color: semanticColors.text.secondary,
		lineHeight: 24,
	},
});
