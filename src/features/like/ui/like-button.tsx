import { ImageResources } from '@/src/shared/libs';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ImageResource } from '@/src/shared/ui';
import {
	Text as RNText,
	StyleSheet,
	View,
	StyleProp,
	ViewStyle,
	Pressable,
	Animated,
	Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { useFeatureCost } from '@features/payment/hooks';
import { useModal } from '@hooks/use-modal';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth';
import { useMixpanel } from '@/src/shared/hooks';
import { useMatchingEfficiency } from '../../matching/hooks/use-matching-efficiency';
import useLike from '../hooks/use-like';
import { LikeOptionModal } from '../../like-letter';

type LikeButtonProps = {
	connectionId: string;
	matchId: string;
	nickname: string;
	profileUrl: string;
	canLetter?: boolean;
	source?: 'home' | 'profile';
	style?: StyleProp<ViewStyle>;
};

export const LikeButton = ({
	connectionId,
	matchId,
	nickname,
	profileUrl,
	canLetter,
	source = 'profile',
	style,
}: LikeButtonProps) => {
	const { redirectTo: currentRedirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
	const { profileDetails } = useAuth();
	const { showModal, hideModal } = useModal();
	const { featureCosts } = useFeatureCost();
	const { onLike } = useLike();
	const { matchingEvents, paymentEvents } = useMixpanel();
	const { trackMatchingAttempt, trackMatchingSuccess, trackMatchingFailure } =
		useMatchingEfficiency();
	const { t } = useTranslation();

	const handleSimpleLike = async () => {
		const gemCost = profileDetails?.gender === 'MALE' ? featureCosts?.LIKE_MESSAGE : 0;
		const currentTime = new Date().getHours();
		const isPeakTime = currentTime >= 20 && currentTime <= 23;

		// 매칭 효율성 분석: 시도 트래킹
		trackMatchingAttempt(connectionId, {
			gemBalance: 0, // TODO: 실제 잔액 가져오기
			timeOfDay: currentTime,
			isPeakTime,
			userTier: profileDetails?.tier,
		});

		// 기존 KPI 이벤트: 매칭 요청
		matchingEvents.trackMatchingRequested(connectionId, gemCost ?? 0);

		// 구슬 사용 이벤트 (남성의 경우)
		if (profileDetails?.gender === 'MALE' && gemCost && gemCost > 0) {
			paymentEvents.trackGemUsed('matching', gemCost);
		}

		const startTime = Date.now();

		try {
			await onLike(connectionId);

			// 성공 시간 측정 및 트래킹
			const responseTime = Date.now() - startTime;
			trackMatchingSuccess(connectionId, {
				matchType: 'mutual_like',
				responseTime,
			});
			// 성공 후 모달 닫기
			hideModal();
		} catch (error: any) {
			// 실패 원인 분석 (useLike에서 이미 처리됨)
			const failureReason = {
				type: error.type || 'UNKNOWN_ERROR',
				category: 'SYSTEM',
				userAction: 'RETRY_LATER',
				recoverable: true,
				severity: 'MEDIUM',
				serverMessage: error.message || t('ui.알_수_없는_오류'),
			};

			trackMatchingFailure(connectionId, failureReason);
			hideModal();
		}
	};

	const handleLetterContinue = () => {
		const basePath = source === 'home' ? '/home' : `/partner/view/${matchId}`;
		const fullRedirectPath = currentRedirectTo
			? `${basePath}?redirectTo=${currentRedirectTo}`
			: basePath;
		router.push({
			pathname: '/like-letter/write',
			params: {
				connectionId,
				matchId,
				nickname,
				profileUrl: encodeURIComponent(profileUrl),
				canLetter: 'true',
				source,
				redirectTo: encodeURIComponent(fullRedirectPath),
			},
		});
	};

	const showLikeOptions = () => {
		showModal({
			custom: () => (
				<LikeOptionModal
					connectionId={connectionId}
					matchId={matchId}
					nickname={nickname}
					profileUrl={profileUrl}
					canLetter={false}
					onSelect={(option) => {
						if (option === 'simple') {
							handleSimpleLike();
						}
					}}
					onClose={hideModal}
				/>
			),
			showLogo: false,
			showParticle: false,
		});
	};

	const translateX = useRef(new Animated.Value(-1)).current;
	const [containerW, setContainerW] = useState(0);

	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(translateX, {
					toValue: 1,
					duration: 2000,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.delay(500),
				Animated.timing(translateX, {
					toValue: -1,
					duration: 0,
					useNativeDriver: true,
				}),
			]),
		);
		loop.start();
		return () => loop.stop();
	}, [translateX]);

	const animatedStyle = {
		transform: [
			{
				translateX: translateX.interpolate({
					inputRange: [-1, 1],
					outputRange: [-containerW, containerW],
				}),
			},
		],
	};

	if (canLetter) {
		return (
			<Pressable
				onPress={handleLetterContinue}
				onLayout={(e) => setContainerW(e.nativeEvent.layout.width || 0)}
				style={[styles.gradientButtonContainer, style]}
			>
				<LinearGradient
					colors={['#9B6DFF', '#7A4AE2', '#6B3FD4']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.gradientButton}
				>
					<RNText style={styles.buttonText}>편지 이어쓰기</RNText>
				</LinearGradient>
				<Animated.View style={[styles.glowOverlay, animatedStyle]}>
					<LinearGradient
						colors={[
							'transparent',
							'rgba(255,255,255,0.05)',
							'rgba(255,255,255,0.15)',
							'rgba(255,255,255,0.2)',
							'rgba(255,255,255,0.15)',
							'rgba(255,255,255,0.05)',
							'transparent',
						]}
						locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 1]}
						start={{ x: 0, y: 0.5 }}
						end={{ x: 1, y: 0.5 }}
						style={StyleSheet.absoluteFill}
					/>
				</Animated.View>
			</Pressable>
		);
	}

	return (
		<Pressable
			onPress={showLikeOptions}
			onLayout={(e) => setContainerW(e.nativeEvent.layout.width || 0)}
			style={[styles.gradientButtonContainer, style]}
		>
			<LinearGradient
				colors={['#9B6DFF', '#7A4AE2', '#6B3FD4']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.gradientButton}
			>
				{profileDetails?.gender === 'MALE' && (
					<View style={styles.gemContainer}>
						<ImageResource resource={ImageResources.GEM} width={31} height={31} />
						<RNText style={styles.gemCountText}>x{featureCosts?.LIKE_MESSAGE}</RNText>
					</View>
				)}
				<RNText style={styles.buttonText}>{t('features.like.ui.like_button.button_label')}</RNText>
			</LinearGradient>
			<Animated.View style={[styles.glowOverlay, animatedStyle]}>
				<LinearGradient
					colors={[
						'transparent',
						'rgba(255,255,255,0.05)',
						'rgba(255,255,255,0.15)',
						'rgba(255,255,255,0.2)',
						'rgba(255,255,255,0.15)',
						'rgba(255,255,255,0.05)',
						'transparent',
					]}
					locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 1]}
					start={{ x: 0, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	gradientButtonContainer: {
		width: '100%',
		height: 56,
		borderRadius: 16,
		borderWidth: 3,
		borderColor: '#6B3FD4',
		overflow: 'hidden',
	},
	gradientButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
		gap: 12,
		flexWrap: 'nowrap',
	},
	glowOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
	},
	gemContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 2,
		flexShrink: 0,
	},
	gemCountText: {
		fontSize: 16,
		fontWeight: '500',
		color: semanticColors.text.inverse,
		includeFontPadding: false,
		textAlignVertical: 'center',
		lineHeight: 31,
	},
	buttonText: {
		fontSize: 20,
		fontWeight: '700',
		color: semanticColors.text.inverse,
		includeFontPadding: false,
		textAlignVertical: 'center',
		lineHeight: 31,
		flexShrink: 0,
	},
});
