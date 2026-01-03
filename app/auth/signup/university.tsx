import { DefaultLayout, TwoButtons } from '@/src/features/layout/ui';
import { SignupSteps } from '@/src/features/signup/hooks';
import useSignupProgress from '@/src/features/signup/hooks/use-signup-progress';
import useUniversityHook from '@/src/features/signup/hooks/use-university-hook';
import UniversityLogos from '@/src/features/signup/ui/university-logos';
import { japanUniversityLogos } from '@/src/features/signup/ui/university-logos/japan-logos-data';
import { koreaUniversityLogos } from '@/src/features/signup/ui/university-logos/korea-logos-data';
import MiniLogoStrip from '@/src/features/signup/ui/university-logos/mini-logo-strip';
import { GraduateBanner } from '@/src/features/signup/ui/university/graduate-banner';
import { SearchTip } from '@/src/features/signup/ui/university/search-tip';
import { SearchingState } from '@/src/features/signup/ui/university/searching-state';
import UniversityCard from '@/src/features/signup/ui/university/university-card';
import { withSignupValidation } from '@/src/features/signup/ui/withSignupValidation';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useKeyboarding } from '@/src/shared/hooks';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { PalePurpleGradient, Show } from '@/src/shared/ui';
import HelpIcon from '@assets/icons/help.svg';
import SearchIcon from '@assets/icons/search.svg';
import Loading from '@features/loading';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Text as RNText, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

function UniversityPage() {
	const router = useRouter();
	const { onboardingEvents } = useMixpanel();
	const hasTrackedView = useRef(false);
	const {
		searchText,
		setSearchText,
		filteredUniv,
		handleClickUniv,
		trigger,
		onNext,
		selectedUniv,
		handleBlur,
		handleFocus,
		isLoading,
		isSearching,
		onBackPress,
		showHeader,
		animatedTitleStyle,
		animatedContainerStyle,
		animatedListStyle,
		handleChange,
		isFocused,
	} = useUniversityHook();
	const { t, i18n } = useTranslation();
	const currentLocale = i18n.language;
	const country = currentLocale?.startsWith('ja') ? 'jp' : 'kr';
	const { isKeyboardVisible } = useKeyboarding();

	const searchTipAnimatedStyle = useAnimatedStyle(() => ({
		opacity: withTiming(isKeyboardVisible ? 0 : 1, { duration: 200 }),
		maxHeight: withTiming(isKeyboardVisible ? 0 : 100, { duration: 200 }),
		overflow: 'hidden' as const,
	}));

	const bottomButtonsAnimatedStyle = useAnimatedStyle(() => ({
		opacity: withTiming(isKeyboardVisible ? 0 : 1, { duration: 200 }),
		transform: [{ translateY: withTiming(isKeyboardVisible ? 50 : 0, { duration: 200 }) }],
	}));

	useEffect(() => {
		if (!hasTrackedView.current) {
			const authMethod = useSignupProgress.getState().authMethod;
			mixpanelAdapter.track('Signup_University_View', {
				auth_method: authMethod,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
			hasTrackedView.current = true;
		}
		onboardingEvents.trackUniversityVerificationStarted();
	}, [onboardingEvents]);

	const handleBackPress = () => {
		onBackPress(() => {
			router.navigate('/auth/login');
		});
	};
	const handleNext = () => {
		onNext(() => {
			// 대학 인증 완료 이벤트 추적
			onboardingEvents.trackUniversityVerificationCompleted('search_selection');
			router.push(`/auth/signup/university-cluster?universityId=${selectedUniv}`);
		});
	};

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', () =>
			onBackPress(() => {
				router.navigate('/auth/login');
			}),
		);
		return () => subscription.remove();
	}, []);

	console.log('[UniversityPage] Render:', {
		trigger,
		isLoading,
		isSearching,
		filteredUnivLength: filteredUniv?.length,
		showHeader,
	});

	return (
		<DefaultLayout style={styles.layout}>
			{!showHeader && <PalePurpleGradient />}
			<View style={[styles.container]}>
				{!trigger && <UniversityLogos logoSize={64} country={country} />}

				<Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
					<RNText style={styles.welcome}>{t('apps.auth.sign_up.university.welcome')}</RNText>
					<RNText style={styles.title}>{t('apps.auth.sign_up.university.title')}</RNText>
				</Animated.View>
				<Animated.View style={[animatedContainerStyle, { width: '100%', zIndex: 10 }]}>
					{!trigger && <GraduateBanner />}
					{trigger && (
						<MiniLogoStrip
							logos={[
								...(country === 'jp' ? japanUniversityLogos.row1 : koreaUniversityLogos.row1),
								...(country === 'jp' ? japanUniversityLogos.row2 : koreaUniversityLogos.row2),
							]}
							logoSize={28}
						/>
					)}
					<View style={[styles.searchWrapper, isFocused && styles.searchWrapperFocused]}>
						<SearchIcon
							width={16}
							height={16}
							style={{ marginRight: 8 }}
							color={isFocused ? semanticColors.brand.primary : '#9B94AB'}
						/>
						<TextInput
							testID="university-search-input"
							value={searchText}
							onBlur={handleBlur}
							onChangeText={handleChange}
							placeholder={t('apps.auth.sign_up.search_university_placeholder')}
							placeholderTextColor="#9B94AB"
							style={styles.input}
							onFocus={handleFocus}
						/>
					</View>
				</Animated.View>
				<Show when={trigger}>
					<Animated.View style={[styles.listAndBottomContainer, animatedListStyle]}>
						{isSearching ? (
							<SearchingState keyword={searchText} />
						) : isLoading ? (
							<Loading.Lottie title={t('apps.auth.sign_up.university.loading')} loading={true} />
						) : (
							<>
								<Animated.View style={searchTipAnimatedStyle}>
									<SearchTip
										title={t('apps.auth.sign_up.university.search_tip_title')}
										description={t('apps.auth.sign_up.university.search_tip_desc')}
									/>
								</Animated.View>
								<ScrollView
									style={styles.scrollView}
									showsVerticalScrollIndicator={false}
									contentContainerStyle={styles.scrollContent}
								>
									{filteredUniv?.map((item) => (
										<UniversityCard
											key={item.id}
											item={item}
											isSelected={selectedUniv === item.id}
											onClick={handleClickUniv(item.id)}
										/>
									))}
								</ScrollView>
							</>
						)}

						<Animated.View style={[styles.bottomContainer, bottomButtonsAnimatedStyle]}>
							<View style={styles.tipContainer}>
								<HelpIcon width={20} height={20} />
								<RNText style={styles.tip}>{t('apps.auth.sign_up.university.tip')}</RNText>
							</View>
							<TwoButtons
								disabledNext={!selectedUniv}
								onClickNext={handleNext}
								onClickPrevious={handleBackPress}
							/>
						</Animated.View>
					</Animated.View>
				</Show>
			</View>
		</DefaultLayout>
	);
}

export default withSignupValidation(UniversityPage, SignupSteps.UNIVERSITY);

const styles = StyleSheet.create({
	layout: {
		position: 'relative',
	},
	container: {
		flex: 1,
		paddingHorizontal: 16,

		alignItems: 'center',
		justifyContent: 'center',
	},
	titleContainer: {
		position: 'absolute',
		alignItems: 'center',
		zIndex: 1,
		transform: [{ translateY: 75 }],
	},
	logoContainer: {
		top: -60,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		color: semanticColors.text.secondary,
		fontFamily: 'Pretendard-Bold',
	},
	searchWrapper: {
		height: 52,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		backgroundColor: semanticColors.surface.background,
		paddingHorizontal: 16,
		width: '100%',
		borderWidth: 2,
		borderColor: semanticColors.border.default,
	},
	searchWrapperFocused: {
		borderColor: semanticColors.brand.primary,
		backgroundColor: '#FDFBFF',
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Regular',
		fontWeight: '400',
	},
	listAndBottomContainer: {
		flex: 1,
		width: '100%',
		marginTop: 24,
		height: '100%',
	},
	scrollView: {
		flex: 1,
		width: '100%',
	},
	scrollContent: {
		paddingBottom: 120,
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingTop: 16,
		backgroundColor: 'transparent',
	},
	tipContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 5,
		marginBottom: 16,
	},
	tip: {
		color: semanticColors.text.disabled,
		fontWeight: '300',
		fontFamily: 'Pretendard-Thin',
		fontSize: 13,
		lineHeight: 20,
	},
	welcome: {
		fontSize: 18,
		color: semanticColors.brand.primary,
		fontFamily: 'Pretendard-SemiBold',
		marginBottom: 8,
		textAlign: 'center',
	},
});
