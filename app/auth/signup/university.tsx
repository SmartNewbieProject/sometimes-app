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
import { UniversityEmptyState } from '@/src/features/signup/ui/university/university-empty-state';
import { withSignupValidation } from '@/src/features/signup/ui/withSignupValidation';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useKeyboarding } from '@/src/shared/hooks';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { useModal } from '@/src/shared/hooks/use-modal';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { PalePurpleGradient, Show } from '@/src/shared/ui';
import SearchIcon from '@assets/icons/search.svg';
import Loading from '@features/loading';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
	BackHandler,
	FlatList,
	Keyboard,
	Platform,
	Pressable,
	Text as RNText,
	StyleSheet,
	TextInput,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

function UniversityPage() {
	const router = useRouter();
	const navigation = useNavigation();
	const { onboardingEvents } = useMixpanel();
	const hasTrackedView = useRef(false);
	const textInputRef = useRef<TextInput>(null);
	const {
		searchText,
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
	const { showModal, hideModal } = useModal();

	const searchTipAnimatedStyle = useAnimatedStyle(() => ({
		opacity: withTiming(isKeyboardVisible ? 0 : 1, { duration: 200 }),
		maxHeight: withTiming(isKeyboardVisible ? 0 : 100, { duration: 200 }),
		overflow: 'hidden' as const,
	}));

	const showButtons = trigger && !!selectedUniv;

	useEffect(() => {
		if (!hasTrackedView.current) {
			const authMethod = useSignupProgress.getState().authMethod;
			mixpanelAdapter.track('Signup_University_View', {
				auth_method: authMethod,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
			onboardingEvents.trackUniversityVerificationStarted();
			hasTrackedView.current = true;
		}
	}, [onboardingEvents]);

	const handleBackPress = useCallback(() => {
		return onBackPress(() => {
			showModal({
				title: '회원가입을 중단하시겠습니까?',
				children: (
					<RNText style={{ textAlign: 'center', color: semanticColors.text.secondary }}>
						로그인 화면으로 이동하면 다시 본인인증을 진행해야 합니다.
					</RNText>
				),
				primaryButton: {
					text: '이동',
					onClick: () => {
						hideModal();
						router.navigate('/auth/login');
					},
				},
				secondaryButton: {
					text: '취소',
					onClick: hideModal,
				},
			});
		});
	}, [hideModal, onBackPress, router, showModal]);

	const handleNext = () => {
		onNext(() => {
			// 대학 인증 완료 이벤트 추적
			onboardingEvents.trackUniversityVerificationCompleted('search_selection');
			router.push(`/auth/signup/university-cluster?universityId=${selectedUniv}`);
			return true;
		});
	};

	const dismissKeyboard = useCallback(() => {
		textInputRef.current?.blur();
		Keyboard.dismiss();
	}, []);

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
		return () => subscription.remove();
	}, [handleBackPress]);

	// iOS 스와이프 뒤로가기 차단: 검색 모드일 때 네비게이션 대신 검색 종료
	useEffect(() => {
		return navigation.addListener('beforeRemove', (e: { preventDefault: () => void }) => {
			if (trigger) {
				e.preventDefault();
				handleBackPress();
			}
		});
	}, [navigation, trigger, handleBackPress]);

	const renderUniversityItem = useCallback(
		({ item }: { item: (typeof filteredUniv)[number] }) => (
			<UniversityCard
				item={item}
				isSelected={selectedUniv === item.id}
				onClick={() => {
					Keyboard.dismiss();
					handleClickUniv(item.id)();
				}}
			/>
		),
		[selectedUniv, handleClickUniv],
	);

	const listFooter = useCallback(
		() => (
			<Pressable
				style={styles.noUnivLink}
				onPress={() => {
					router.push(
						`/auth/signup/register-university?name=${encodeURIComponent(searchText)}`,
					);
				}}
			>
				<RNText style={styles.noUnivText}>
					{t('apps.auth.sign_up.university.no_university_link')}
				</RNText>
			</Pressable>
		),
		[searchText, router, t],
	);

	return (
		<View style={{ flex: 1 }}>
			<DefaultLayout style={styles.layout}>
				{!showHeader && <PalePurpleGradient />}
				<TouchableWithoutFeedback onPress={dismissKeyboard}>
					<View style={[styles.container, { paddingTop: trigger ? 12 : 60 }]}>
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
							<Pressable
								style={[styles.searchWrapper, isFocused && styles.searchWrapperFocused]}
								onPress={() => textInputRef.current?.focus()}
							>
								<SearchIcon
									width={16}
									height={16}
									style={{ marginRight: 8 }}
									color={isFocused ? semanticColors.brand.primary : '#9B94AB'}
								/>
								<TextInput
									ref={textInputRef}
									testID="university-search-input"
									value={searchText}
									onBlur={handleBlur}
									onChangeText={handleChange}
									placeholder={t('apps.auth.sign_up.search_university_placeholder')}
									placeholderTextColor="#9B94AB"
									style={styles.input}
									onFocus={handleFocus}
								/>
							</Pressable>
						</Animated.View>
						{!trigger && (
							<Animated.View style={[styles.titleContainer, animatedTitleStyle]} pointerEvents="none">
								<RNText style={styles.welcome}>{t('apps.auth.sign_up.university.welcome')}</RNText>
								<RNText style={styles.title}>{t('apps.auth.sign_up.university.title')}</RNText>
							</Animated.View>
						)}
						{!trigger && <UniversityLogos logoSize={64} country={country} />}
						<Show when={trigger}>
							<Animated.View style={[styles.listAndBottomContainer, animatedListStyle]}>
								{isSearching ? (
									<Pressable onPress={dismissKeyboard} style={styles.dismissArea}>
										<SearchingState keyword={searchText} />
									</Pressable>
								) : isLoading ? (
									<Pressable onPress={dismissKeyboard} style={styles.dismissArea}>
										<Loading.Lottie
											title={t('apps.auth.sign_up.university.loading')}
											loading={true}
										/>
									</Pressable>
								) : (
									<>
										<Animated.View style={searchTipAnimatedStyle}>
											<SearchTip
												title={t('apps.auth.sign_up.university.search_tip_title')}
												description={t('apps.auth.sign_up.university.search_tip_desc')}
											/>
										</Animated.View>
										{filteredUniv?.length === 0 && searchText.length > 0 ? (
											<Pressable onPress={dismissKeyboard} style={styles.scrollPressable}>
												<UniversityEmptyState
													keyword={searchText}
													onRegisterPress={() => {
														router.push(
															`/auth/signup/register-university?name=${encodeURIComponent(searchText)}`,
														);
													}}
												/>
											</Pressable>
										) : (
											<FlatList
												data={filteredUniv}
												keyExtractor={(item) => item.id}
												renderItem={renderUniversityItem}
												initialNumToRender={15}
												maxToRenderPerBatch={10}
												windowSize={5}
												showsVerticalScrollIndicator={false}
												contentContainerStyle={[
													styles.scrollContent,
													isKeyboardVisible && styles.scrollContentKeyboardVisible,
												]}
												keyboardDismissMode="on-drag"
												keyboardShouldPersistTaps="handled"
												ListFooterComponent={listFooter}
											/>
										)}
									</>
								)}
							</Animated.View>
						</Show>
					</View>
				</TouchableWithoutFeedback>
			</DefaultLayout>
			{showButtons && (
				<View style={styles.bottomContainer}>
					<TwoButtons
						disabledNext={!selectedUniv}
						onClickNext={handleNext}
						onClickPrevious={handleBackPress}
					/>
				</View>
			)}
		</View>
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
		justifyContent: 'flex-start',
	},
	titleContainer: {
		alignItems: 'center',
		width: '100%',
		marginTop: 24,
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
	},
	scrollContent: {
		paddingBottom: 80,
	},
	scrollContentKeyboardVisible: {
		paddingBottom: 24,
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
	},
	welcome: {
		fontSize: 18,
		color: semanticColors.brand.primary,
		fontFamily: 'Pretendard-SemiBold',
		marginBottom: 8,
		textAlign: 'center',
	},
	scrollPressable: {
		flexGrow: 1,
	},
	dismissArea: {
		flex: 1,
	},
	noUnivLink: {
		alignItems: 'center',
		paddingVertical: 16,
		marginBottom: 8,
	},
	noUnivText: {
		fontSize: 13,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
		textDecorationLine: 'underline',
	},
});
