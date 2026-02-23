import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useDebounce } from '@/src/shared/hooks';
import { getSmartUnivLogoUrl } from '@/src/shared/libs';
import type { RegionCode } from '@/src/shared/constants/region';
import i18n from '@/src/shared/libs/i18n';
import Signup from '@features/signup';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { getTopUniversities, searchUniversities } from '../apis';
import { getRegionsByRegionCode } from '../lib';

const { SignupSteps, useChangePhase, useSignupProgress, useSignupAnalytics } = Signup;

function useUniversityHook() {
	const { updateForm, form: userForm, regions } = useSignupProgress();
	const [searchText, setSearchText] = useState(userForm.universitySearchText || '');
	const debouncedSearchText = useDebounce(searchText, 1500);
	const [selectedUniv, setSelectedUniv] = useState<string | undefined>(userForm.universityId);
	const params = useLocalSearchParams();
	const hasProcessedPassInfo = useRef(false);
	const screenEnteredAt = useRef(Date.now());
	const [trigger, setTrigger] = useState(false);
	const { updateShowHeader, showHeader, updateRegions, updateUnivTitle } = useSignupProgress();
	const [isFocused, setIsFocused] = useState(false);

	// 현재 로케일에 따른 국가 코드
	const locale = i18n.language || 'ko';
	const country = locale.startsWith('ja') ? 'jp' : 'kr';

	const { data: topUnivs, isLoading: isLoadingTop } = useQuery({
		queryKey: ['universities', 'top', country],
		queryFn: () => getTopUniversities(country),
	});

	useEffect(() => {
		console.log('[University] 국가:', country);
		if (topUnivs) {
			console.log('[University] Top API 응답:', topUnivs.length, '개');
			console.log('[University] 첫 번째 대학 원본:', topUnivs[0]);
		} else {
			console.log('[University] Top API 응답 없음');
		}
	}, [topUnivs, country]);

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
		const mapped = rawUnivs?.map((item) => ({
			...item,
			logoUrl: getSmartUnivLogoUrl(item.code, country),
			universityType: item.foundation,
			area: getRegionsByRegionCode(item.region),
		}));
		console.log('[University] 매핑된 대학 수:', mapped?.length);
		console.log('[University] 첫 번째 대학:', mapped?.[0]);
		return mapped;
	}, [rawUnivs, country]);

	const filteredUniv = useMemo(() => {
		if (!univs) {
			console.log('[University] univs가 없음');
			return [];
		}
		// 현재 언어에 맞는 locale로 정렬
		const locale = i18n.language || 'ko';
		console.log('[University] 정렬 locale:', locale);
		const sorted = [...univs].sort((a, b) => a.name.localeCompare(b.name, locale));
		console.log('[University] 정렬된 대학 수:', sorted.length);
		console.log(
			'[University] 처음 3개:',
			sorted.slice(0, 3).map((u) => u.name),
		);
		console.log(
			'[University] trigger:',
			trigger,
			'isLoading:',
			isLoading,
			'isSearching:',
			isActuallySearching,
		);
		return sorted;
	}, [univs, trigger, isLoading, isActuallySearching]);

	useEffect(() => {
		if (
			debouncedSearchText.length > 0
			&& searchResults !== undefined
			&& searchResults.length === 0
			&& !isSearching
		) {
			mixpanelAdapter.track('Signup_University_Not_Found', {
				search_query: debouncedSearchText,
				auth_method: useSignupProgress.getState().authMethod,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
		}
	}, [debouncedSearchText, searchResults, isSearching]);

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

	const selectedUnivObj = filteredUniv?.find((item) => item.id === selectedUniv);

	const handleFocus = () => {
		if (!isFocused) {
			setTrigger(true);
			setIsFocused(true);
			updateShowHeader(true);

			titleOpacity.value = withTiming(0, { duration: 0 });
			containerTranslateY.value = withTiming(0, { duration: 350 });
			listOpacity.value = withTiming(1, { duration: 350 });
			listTranslateY.value = withTiming(0, { duration: 350 });
		}
	};

	const onBackPress = (fallback: () => void) => {
		if (isFocused) {
			setTrigger(false);
			setIsFocused(false);
			setSearchText('');
			Keyboard.dismiss();
			updateShowHeader(false);

			titleOpacity.value = withTiming(1, { duration: 0 });
			containerTranslateY.value = withTiming(150, { duration: 0 });
			listOpacity.value = withTiming(0, { duration: 0 });
			listTranslateY.value = withTiming(50, { duration: 0 });
		} else {
			mixpanelAdapter.track('Signup_University_Abandoned', {
				had_search: searchText.length > 0 || debouncedSearchText.length > 0,
				search_query: debouncedSearchText || undefined,
				search_results_count: filteredUniv?.length ?? 0,
				had_selection: !!selectedUniv,
				time_spent_seconds: Math.round((Date.now() - screenEnteredAt.current) / 1000),
				auth_method: useSignupProgress.getState().authMethod,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
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
		setIsFocused(false);
		Keyboard.dismiss();
	};

	const onNext = (fallback: () => void) => {
		if (!selectedUniv) {
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
		if (selectedUnivObj) {
			updateRegions([selectedUnivObj.region]);
			updateUnivTitle(selectedUnivObj.name);
			fallback();
		}
	};

	useEffect(() => {
		updateShowHeader(false);
		setIsFocused(false);
		setTrigger(false);

		titleOpacity.value = 1;
		containerTranslateY.value = 150;
		listOpacity.value = 0;
		listTranslateY.value = 50;
	}, []);

	// 페이지가 포커스될 때 초기 상태 복원 (로고 표시)
	useFocusEffect(
		useCallback(() => {
			setTrigger(false);
			setIsFocused(false);
		}, []),
	);

	useEffect(() => {
		if (userForm.universityId && userForm.universityId !== selectedUniv) {
			setSelectedUniv(userForm.universityId);
		}
	}, [userForm]);

	useChangePhase(SignupSteps.UNIVERSITY);

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
