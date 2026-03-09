import type { RegionCode } from '@/src/shared/constants/region';
import { useDebounce } from '@/src/shared/hooks';
import { getSmartUnivLogoUrl } from '@/src/shared/libs';
import i18n from '@/src/shared/libs/i18n';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import Signup from '@features/signup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { getTopUniversities, searchUniversities } from '../apis';
import { getRegionsByRegionCode } from '../lib';

const { SignupSteps, useChangePhase, useSignupProgress, useSignupAnalytics } = Signup;

function useUniversityHook() {
	const { updateForm, form: userForm, regions } = useSignupProgress();
	const [searchText, setSearchText] = useState(userForm.universitySearchText || '');
	const debouncedSearchText = useDebounce(searchText, 500);
	const [selectedUniv, setSelectedUniv] = useState<string | undefined>(userForm.universityId);
	const params = useLocalSearchParams();
	const hasProcessedPassInfo = useRef(false);
	const [trigger, setTrigger] = useState(false);
	const { updateShowHeader, showHeader, updateRegions, updateUnivTitle } = useSignupProgress();
	const [isFocused, setIsFocused] = useState(false);
	const isInputFocusedRef = useRef(false);

	// 현재 로케일에 따른 국가 코드
	const locale = i18n.language || 'ko';
	const country = locale.startsWith('ja') ? 'jp' : 'kr';

	const { data: topUnivs, isLoading: isLoadingTop } = useQuery({
		queryKey: ['universities', 'top', country],
		queryFn: () => getTopUniversities(country),
	});

	const { data: searchResults, isLoading: isSearching } = useQuery({
		queryKey: ['universities', 'search', debouncedSearchText, country],
		queryFn: () => searchUniversities(debouncedSearchText, country),
		enabled: debouncedSearchText.length > 0,
	});

	const rawUnivs = debouncedSearchText ? searchResults : topUnivs;
	const isLoading = debouncedSearchText ? isSearching : isLoadingTop;

	const isDebouncing = searchText.length > 0 && searchText !== debouncedSearchText;
	const isActuallySearching = isDebouncing || isSearching;

	const univs = useMemo(() => {
		return rawUnivs?.map((item) => ({
			...item,
			logoUrl: getSmartUnivLogoUrl(item.code, country),
			universityType: item.foundation,
			area: getRegionsByRegionCode(item.region),
		}));
	}, [rawUnivs, country]);

	const filteredUniv = useMemo(() => {
		if (!univs) return [];
		const locale = i18n.language || 'ko';
		return [...univs].sort((a, b) => a.name.localeCompare(b.name, locale));
	}, [univs]);

	const titleOpacity = useSharedValue(0);
	const containerTranslateY = useSharedValue(0);
	const listOpacity = useSharedValue(1);
	const listTranslateY = useSharedValue(0);

	const animatedTitleStyle = useAnimatedStyle(() => ({
		opacity: titleOpacity.value,
	}));

	const animatedContainerStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: containerTranslateY.value }],
	}));

	const animatedListStyle = useAnimatedStyle(() => ({
		opacity: listOpacity.value,
		transform: [{ translateY: listTranslateY.value }],
	}));

	const handleFocus = () => {
		isInputFocusedRef.current = true;
		if (!isFocused) {
			setTrigger(true);
			setIsFocused(true);
			updateShowHeader(true);
			titleOpacity.value = withTiming(0, { duration: 0 });
		}
	};

	const onBackPress = (fallback: () => void) => {
		if (trigger) {
			setTrigger(false);
			setIsFocused(false);
			setSearchText('');
			Keyboard.dismiss();
			updateShowHeader(false);

			titleOpacity.value = withTiming(1, { duration: 0 });
			containerTranslateY.value = withTiming(0, { duration: 0 });
			listOpacity.value = withTiming(0, { duration: 0 });
			listTranslateY.value = withTiming(50, { duration: 0 });
		} else {
			fallback();
		}
		return true;
	};

	const handleChange = useCallback(
		(text: string) => {
			setSearchText(text);
			updateForm({ universitySearchText: text });
		},
		[updateForm],
	);

	const handleBlur = () => {
		isInputFocusedRef.current = false;
		setIsFocused(false);
	};

	const onNext = (fallback: () => void) => {
		if (!selectedUniv) {
			return;
		}
		const univObj = filteredUniv?.find((item) => item.id === selectedUniv);
		if (!univObj) {
			return;
		}
		trackSignupEvent('next_button_click', 'to_university_details');
		updateForm({
			...userForm,
			universityId: selectedUniv,
		});
		const authMethod = useSignupProgress.getState().authMethod;
		mixpanelAdapter.track('Signup_university', {
			university: selectedUniv,
			auth_method: authMethod,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
		updateRegions([univObj.region]);
		updateUnivTitle(univObj.name);
		fallback();
	};

	// trigger 변경 후 컴포넌트 마운트 완료 시점에 애니메이션 시작 (Android 호환)
	useEffect(() => {
		if (trigger) {
			listOpacity.value = 0;
			listTranslateY.value = 50;
			listOpacity.value = withTiming(1, { duration: 300 });
			listTranslateY.value = withTiming(0, { duration: 300 });
		} else {
			listOpacity.value = 0;
			listTranslateY.value = 50;
		}
	}, [trigger]);

	useEffect(() => {
		updateShowHeader(false);
		setIsFocused(false);
		setTrigger(false);

		titleOpacity.value = 1;
		containerTranslateY.value = 0;
		listOpacity.value = 0;
		listTranslateY.value = 50;
	}, []);

	// 페이지가 포커스될 때 초기 상태 복원 (로고 표시 + 애니메이션 값 리셋)
	useFocusEffect(
		useCallback(() => {
			// Android에서 키보드 열릴 때 네비게이션 focus 이벤트가 재발행될 수 있음
			// 입력창이 포커스된 상태면 리셋하지 않음
			if (isInputFocusedRef.current) {
				return;
			}
			setTrigger(false);
			setIsFocused(false);
			updateShowHeader(false);

			titleOpacity.value = 1;
			containerTranslateY.value = 0;
			listOpacity.value = 0;
			listTranslateY.value = 50;
		}, []),
	);

	useEffect(() => {
		if (userForm.universityId && userForm.universityId !== selectedUniv) {
			setSelectedUniv(userForm.universityId);
		}
	}, [userForm]);

	useChangePhase(SignupSteps.UNIVERSITY);

	// 이상형 테스트 세션 ID를 URL 파라미터에서 읽어 form에 저장
	useEffect(() => {
		if (params.idealTypeSessionId) {
			updateForm({
				idealTypeTestSessionId: params.idealTypeSessionId as string,
			});
		}
	}, [params.idealTypeSessionId]);

	// 보안: AsyncStorage에서 certificationInfo를 읽어옴 (URL에서 제거)
	useEffect(() => {
		const loadCertificationInfo = async () => {
			if (hasProcessedPassInfo.current) return;

			try {
				// AsyncStorage에서 먼저 시도
				let certInfoStr = await AsyncStorage.getItem('signup_certification_info');

				// AsyncStorage에 없으면 URL params에서 fallback (기존 사용자 지원)
				if (!certInfoStr && params.certificationInfo) {
					certInfoStr = params.certificationInfo as string;
					// URL params에서 가져온 경우, AsyncStorage에 저장
					await AsyncStorage.setItem('signup_certification_info', certInfoStr);
				}

				if (certInfoStr) {
					hasProcessedPassInfo.current = true;
					const certInfo = JSON.parse(certInfoStr);

					if (certInfo?.loginType === 'apple') {
						return;
					}

					updateForm({
						...userForm,
						passVerified: true,
						name: certInfo.name,
						phone: certInfo.phone,
						gender: certInfo.gender,
						birthday: certInfo.birthday,
						kakaoId: certInfo?.externalId,
						loginType: certInfo?.loginType || 'pass',
						identityVerificationId: certInfo?.identityVerificationId,
						kakaoCode: certInfo?.kakaoCode,
						kakaoAccessToken: certInfo?.kakaoAccessToken,
					});
				}
			} catch (error) {
				console.error('Failed to load certification info:', error);
			}
		};

		loadCertificationInfo();
	}, [params.certificationInfo]);

	const { trackSignupEvent } = useSignupAnalytics('university');

	const handleClickUniv = useCallback(
		(univ: string) => () => {
			setSelectedUniv((prev) => (prev === univ ? undefined : univ));
			Keyboard.dismiss();
		},
		[],
	);

	return {
		isLoading,
		isSearching: isActuallySearching,
		filteredUniv,
		searchText,
		setSearchText,
		handleClickUniv,
		selectedUniv,
		regions,
		animatedTitleStyle,
		animatedContainerStyle,
		animatedListStyle,
		showHeader,
		trigger,
		handleFocus,
		handleBlur,
		onNext,
		onBackPress,
		isFocused,
		handleChange,
	};
}

const styles = StyleSheet.create({});

export default useUniversityHook;
