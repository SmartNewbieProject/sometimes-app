import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { useDebounce } from "@/src/shared/hooks";
import { getSmartUnivLogoUrl } from "@/src/shared/libs";
import type { RegionCode } from "@/src/shared/constants/region";
import Signup from "@features/signup";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Keyboard, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { getTopUniversities, searchUniversities } from "../apis";
import { getRegionsByRegionCode } from "../lib";

const { SignupSteps, useChangePhase, useSignupProgress, useSignupAnalytics } =
  Signup;

function useUniversityHook() {
  const { updateForm, form: userForm, regions } = useSignupProgress();
  const [searchText, setSearchText] = useState(userForm.universitySearchText || "");
  const debouncedSearchText = useDebounce(searchText, 1500);
  const [selectedUniv, setSelectedUniv] = useState<string | undefined>(
    userForm.universityId
  );
  const params = useLocalSearchParams();
  const hasProcessedPassInfo = useRef(false);
  const [trigger, setTrigger] = useState(true);
  const { updateShowHeader, showHeader, updateRegions, updateUnivTitle } =
    useSignupProgress();
  const [isFocused, setIsFocused] = useState(false);

  const { data: topUnivs, isLoading: isLoadingTop } = useQuery({
    queryKey: ["universities", "top"],
    queryFn: getTopUniversities,
  });

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["universities", "search", debouncedSearchText],
    queryFn: () => searchUniversities(debouncedSearchText),
    enabled: debouncedSearchText.length > 0,
  });

  const rawUnivs = debouncedSearchText ? searchResults : topUnivs;
  const isLoading = debouncedSearchText ? isSearching : isLoadingTop;

  const isDebouncing = searchText.length > 0 && searchText !== debouncedSearchText;
  const isActuallySearching = isDebouncing || isSearching;

  const univs = useMemo(() => {
    return rawUnivs?.map((item) => ({
      ...item,
      logoUrl: getSmartUnivLogoUrl(item.code),
      universityType: item.foundation,
      area: getRegionsByRegionCode(item.region as RegionCode),
    }));
  }, [rawUnivs]);

  const filteredUniv = useMemo(() => {
    if (!univs) return [];
    const sorted = [...univs].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    return sorted;
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

  const selectedUnivObj = filteredUniv?.find(
    (item) => item.id === selectedUniv
  );

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
      setSearchText("");
      Keyboard.dismiss();
      updateShowHeader(false);

      titleOpacity.value = withTiming(1, { duration: 0 });
      containerTranslateY.value = withTiming(60, { duration: 0 });
      listOpacity.value = withTiming(0, { duration: 0 });
      listTranslateY.value = withTiming(50, { duration: 0 });
    } else {
      fallback();
    }
    return true;
  };

  const handleChange = useCallback((text: string) => {
    setSearchText(text);
    updateForm({ universitySearchText: text });
  }, [updateForm]);

  const handleBlur = () => {
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const onNext = (fallback: () => void) => {
    if (!selectedUniv) {
      return;
    }
    trackSignupEvent("next_button_click", "to_university_details");
    updateForm({
      ...userForm,
      universityId: selectedUniv,
    });
    mixpanelAdapter.track("Signup_university", {
      university: selectedUniv,
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });
    if (selectedUnivObj) {
      updateRegions([selectedUnivObj.region]);
      updateUnivTitle(selectedUnivObj.name);
      fallback();
    }
  };

  useEffect(() => {
    updateShowHeader(true);
    setIsFocused(false);
    setTrigger(true);

    titleOpacity.value = 0;
    containerTranslateY.value = 0;
    listOpacity.value = 1;
    listTranslateY.value = 0;
  }, []);

  // 페이지가 포커스될 때마다 리스트를 보이도록 설정
  useFocusEffect(
    useCallback(() => {
      setTrigger(true);
      setIsFocused(false);
    }, [])
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
            loginType: certInfo?.loginType || "pass",
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

  const { trackSignupEvent } = useSignupAnalytics("university");

  const handleClickUniv = useCallback(
    (univ: string) => () => {
      setSelectedUniv((prev) => (prev === univ ? undefined : univ));
      Keyboard.dismiss();
    },
    []
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
