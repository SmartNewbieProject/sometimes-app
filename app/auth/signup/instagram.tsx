import { DefaultLayout, TwoButtons } from '@/src/features/layout/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Signup from '@/src/features/signup';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { withSignupValidation } from '@/src/features/signup/ui/withSignupValidation';
import HeartIcon from '@assets/icons/area-fill-heart.svg';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withRepeat,
	withSequence,
	interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { SignupSteps, useChangePhase, useSignupProgress, useSignupAnalytics } = Signup;
function SignupInstagram() {
	const { updateForm, updateShowHeader, form } = useSignupProgress();
	const [instagramId, setInstagramId] = useState(form.instagramId || '');
	const [isFocused, setIsFocused] = useState(false);
	const { t } = useTranslation();
	const previousLengthRef = useRef(0);
	const hasTrackedView = useRef(false);

	useChangePhase(SignupSteps.INSTAGRAM);
	const { trackSignupEvent } = useSignupAnalytics('university_details');

	// 애니메이션 값
	const atSymbolOpacity = useSharedValue(0.3);
	const atSymbolGlow = useSharedValue(0);
	const borderColorProgress = useSharedValue(0);
	const logoScale = useSharedValue(1);
	const logoGlow = useSharedValue(0);

	useEffect(() => {
		if (!hasTrackedView.current) {
			mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_INSTAGRAM_VIEW, {
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
			hasTrackedView.current = true;
		}
		updateShowHeader(true);
	}, [updateShowHeader]);

	// 햅틱 피드백 및 사운드 효과
	const triggerTypingFeedback = () => {
		// 햅틱 피드백 (모바일만)
		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}

		// 타이핑 사운드 (웹 포함)
		if (Platform.OS === 'web' && typeof window !== 'undefined') {
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.value = 800;
			oscillator.type = 'sine';

			gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + 0.05);
		}
	};

	// @ 심볼 애니메이션 + 글로우
	useEffect(() => {
		const isTyping = instagramId.length > 0;

		atSymbolOpacity.value = withSpring(isTyping ? 1 : 0.3, {
			damping: 15,
			stiffness: 150,
		});

		// @ 심볼 글로우 효과
		if (isTyping) {
			atSymbolGlow.value = withRepeat(
				withSequence(withSpring(1, { damping: 20 }), withSpring(0, { damping: 20 })),
				-1,
				true,
			);
		} else {
			atSymbolGlow.value = withSpring(0);
		}

		// 첫 글자 입력 시 강한 햅틱
		if (instagramId.length === 1 && previousLengthRef.current === 0) {
			if (Platform.OS !== 'web') {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			}
		}

		previousLengthRef.current = instagramId.length;
	}, [instagramId]);

	// 포커스 시 밑줄 색상 애니메이션
	useEffect(() => {
		borderColorProgress.value = withSpring(isFocused ? 1 : 0, {
			damping: 20,
			stiffness: 200,
		});
	}, [isFocused]);

	// 입력 시작 시 로고 애니메이션
	useEffect(() => {
		if (instagramId.length > 0) {
			logoScale.value = withSequence(
				withSpring(1.1, { damping: 10 }),
				withSpring(1, { damping: 15 }),
			);
			logoGlow.value = withRepeat(
				withSequence(withSpring(1, { damping: 20 }), withSpring(0, { damping: 20 })),
				-1,
				true,
			);
		} else {
			logoGlow.value = withSpring(0);
		}
	}, [instagramId.length > 0]);

	// 애니메이션 스타일
	const atSymbolAnimatedStyle = useAnimatedStyle(() => ({
		opacity: atSymbolOpacity.value,
	}));

	const atSymbolGlowAnimatedStyle = useAnimatedStyle(() => {
		const glowIntensity = atSymbolGlow.value;
		return {
			textShadowColor: `rgba(124, 58, 237, ${glowIntensity * 0.8})`,
			textShadowOffset: { width: 0, height: 0 },
			textShadowRadius: 12 * glowIntensity,
		};
	});

	const inputWrapperAnimatedStyle = useAnimatedStyle(() => {
		if (Platform.OS === 'web') {
			// 웹에서는 단순 조건부 처리
			return {
				borderBottomColor: borderColorProgress.value > 0.5 ? '#7C3AED' : '#E2D9FF',
			};
		}

		// 모바일에서는 interpolateColor 사용
		const borderColor = interpolateColor(borderColorProgress.value, [0, 1], ['#E2D9FF', '#7C3AED']);
		return {
			borderBottomColor: borderColor,
		};
	});

	const logoAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: logoScale.value }],
		opacity: 1 - logoGlow.value * 0.3,
	}));

	const logoGlowStyle = useAnimatedStyle(() => ({
		opacity: logoGlow.value * 0.5,
	}));

	const onNext = async () => {
		// 인스타그램 ID는 선택사항 - 빈 값도 허용
		updateForm({ instagramId: instagramId || '' });

		if (instagramId) {
			trackSignupEvent('next_button_click', 'to_profile_image');
			mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_INSTAGRAM_ENTERED, {
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
		} else {
			// 인스타그램 입력 스킵
			mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_INSTAGRAM_SKIPPED, {
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
		}

		router.push('/auth/signup/profile-image');
	};

	useEffect(() => {
		const onBackPress = () => {
			router.navigate('/auth/signup/university-details');
			return true;
		};

		// 이벤트 리스너 등록
		const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

		// 컴포넌트 언마운트 시 리스너 제거
		return () => subscription.remove();
	}, []);

	return (
		<>
			<DefaultLayout>
				<View
					style={{
						flex: 1,
						paddingHorizontal: 20,
					}}
				>
					<View>
						<View style={styles.logoContainer}>
							{Platform.OS === 'web' ? (
								// 웹용 로고 (CSS 애니메이션)
								<View
									style={{
										// @ts-ignore
										animation: instagramId.length > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
									}}
								>
									<Image
										source={require('@assets/images/instagram.png')}
										style={
											{
												width: 81,
												height: 81,
												// Web-only CSS properties for shadow effect
												...(Platform.OS === 'web' && {
													filter:
														instagramId.length > 0
															? 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))'
															: 'none',
													transition: 'filter 0.3s ease',
												}),
											} as any
										}
									/>
								</View>
							) : (
								// 모바일용 로고 (Reanimated)
								<Animated.View style={[logoAnimatedStyle]}>
									<Image
										source={require('@assets/images/instagram.png')}
										style={{ width: 81, height: 81 }}
									/>
									<Animated.View style={[styles.logoGlowOverlay, logoGlowStyle]} />
								</Animated.View>
							)}
						</View>

						<View style={[styles.contentWrapper, { zIndex: 10 }]}>
							<View style={styles.titleWrapper}>
								<Text style={styles.title}>{t('apps.auth.sign_up.instagram.title')}</Text>
								<Text style={styles.subtitle}>{t('apps.auth.sign_up.instagram.subtitle')}</Text>
							</View>
							{Platform.OS === 'web' ? (
								// 웹용 렌더링 (일반 컴포넌트 + CSS)
								<View style={[styles.inputWrapper, isFocused && { borderBottomColor: '#7C3AED' }]}>
									<Text
										style={[
											styles.instagramText,
											{
												opacity: instagramId.length > 0 ? 1 : 0.3,
												// @ts-ignore
												animation:
													instagramId.length > 0 ? 'textGlow 2s ease-in-out infinite' : 'none',
											},
										]}
									>
										@
									</Text>
									<TextInput
										value={instagramId}
										onChangeText={(text) => {
											setInstagramId(text);
											triggerTypingFeedback();
										}}
										onFocus={() => setIsFocused(true)}
										onBlur={() => setIsFocused(false)}
										style={styles.input}
										autoCapitalize="none"
										autoCorrect={false}
										placeholder=""
									/>
								</View>
							) : (
								// 모바일용 렌더링 (Reanimated)
								<Animated.View style={[styles.inputWrapper, inputWrapperAnimatedStyle]}>
									<Animated.Text
										style={[styles.instagramText, atSymbolAnimatedStyle, atSymbolGlowAnimatedStyle]}
									>
										@
									</Animated.Text>
									<TextInput
										value={instagramId}
										onChangeText={(text) => {
											setInstagramId(text);
											triggerTypingFeedback();
										}}
										onFocus={() => setIsFocused(true)}
										onBlur={() => setIsFocused(false)}
										style={styles.input}
										autoCapitalize="none"
										autoCorrect={false}
										placeholder=""
									/>
								</Animated.View>
							)}
						</View>
					</View>
				</View>

				<View style={[styles.bottomContainer, { width: '100%' }]}>
					<View style={styles.tipConatainer}>
						<HeartIcon width={20} height={20} />
						<Text style={styles.tip}>{t('apps.auth.sign_up.instagram.tip')}</Text>
					</View>
					<TwoButtons
						disabledNext={false}
						onClickNext={onNext}
						onClickPrevious={() => {
							router.navigate('/auth/signup/university-details');
						}}
					/>
				</View>
			</DefaultLayout>
		</>
	);
}

export default withSignupValidation(SignupInstagram, SignupSteps.INSTAGRAM);

const styles = StyleSheet.create({
	logoContainer: {
		paddingHorizontal: 5,
		marginBottom: 16,
	},
	logoGlowOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: 81,
		height: 81,
		backgroundColor: '#7C3AED',
		borderRadius: 16,
	},
	titleWrapper: {
		gap: 4,
	},
	title: {
		fontFamily: 'Pretendard-SemiBold',
		fontSize: 18,
		lineHeight: 22,
		color: semanticColors.brand.primary,
	},
	subtitle: {
		fontFamily: 'Pretendard-Regular',
		fontSize: 14,
		lineHeight: 20,
		color: semanticColors.text.muted,
	},
	contentWrapper: {
		gap: 15,
		marginTop: 34,
		paddingHorizontal: 10,
	},
	inputWrapper: {
		width: 306,
		borderBottomColor: '#E2D9FF',
		borderBottomWidth: 1,
		paddingBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		...(Platform.OS === 'web' && {
			// @ts-ignore - 웹 전용 CSS
			transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
		}),
	},
	input: {
		flex: 1,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Light',
		lineHeight: 22,
		textAlignVertical: 'center',
		paddingVertical: 0,
		fontSize: 15,
		marginLeft: 1,
		...(Platform.OS === 'web' && {
			// @ts-ignore
			outline: 'none',
		}),
	},
	instagramText: {
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Light',
		lineHeight: 22,
		fontSize: 15,
		...(Platform.OS === 'web' && {
			// @ts-ignore - 웹 전용 CSS
			transition: 'opacity 0.3s ease, text-shadow 0.3s ease',
		}),
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		paddingTop: 16,
		paddingHorizontal: 0,
		backgroundColor: 'transparent',
	},
	tipConatainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 5,
		marginBottom: 16,
	},
	tip: {
		color: semanticColors.text.disabled,
		fontFamily: 'Pretendard-Light',
		fontSize: 13,
		lineHeight: 20,
	},
});
