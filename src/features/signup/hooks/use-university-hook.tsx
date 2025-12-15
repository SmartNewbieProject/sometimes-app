import { track } from "@/src/shared/libs/amplitude-compat";
import Signup from "@features/signup";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { filterUniversities } from "../lib";
import useUniversities from "../queries/use-universities";

const { SignupSteps, useChangePhase, useSignupProgress, useSignupAnalytics } =
  Signup;

function useUniversityHook() {
  const [searchText, setSearchText] = useState("");
  const { updateForm, form: userForm, regions } = useSignupProgress();
  const { isLoading, data: univs } = useUniversities();
  const [selectedUniv, setSelectedUniv] = useState<string | undefined>(
    userForm.universityId
  );
  const params = useLocalSearchParams();
  const hasProcessedPassInfo = useRef(false);
  const [trigger, setTrigger] = useState(false);
  const [filteredUniv, setFilteredUniv] = useState(univs);
  const { updateShowHeader, showHeader, updateRegions, updateUnivTitle } =
    useSignupProgress();
  const [isFocused, setIsFocused] = useState(false);

  const titleOpacity = useSharedValue(1);
  const containerTranslateY = useSharedValue(60);
  const listOpacity = useSharedValue(0);
  const listTranslateY = useSharedValue(50);

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
  }, []);

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
    track("Signup_university", {
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
    updateShowHeader(false);
    setIsFocused(false);
    setTrigger(false);

    titleOpacity.value = 1;
    containerTranslateY.value = 60;
    listOpacity.value = 0;
    listTranslateY.value = 50;
  }, []);

  useChangePhase(SignupSteps.UNIVERSITY);

  useEffect(() => {
    if (params.certificationInfo && !hasProcessedPassInfo.current) {
      hasProcessedPassInfo.current = true;
      const certInfo = JSON.parse(params.certificationInfo as string);
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
  }, [params.certificationInfo]);

  const { trackSignupEvent } = useSignupAnalytics("university");

  const handleClickUniv = useCallback(
    (univ: string) => () => {
      setSelectedUniv((prev) => (prev === univ ? undefined : univ));
    },
    []
  );

  useEffect(() => {
    if (!univs) return;

    const filtered = filterUniversities(univs ?? [], searchText);
    const selected = univs.find((u) => u.name === selectedUniv);
    const merged =
      selected && !filtered.some((u) => u.name === selected.name)
        ? [selected, ...filtered]
        : filtered;
    const sorted = [...merged].sort((a, b) =>
      a.name.localeCompare(b.name, "ko")
    );

    setFilteredUniv(sorted);
  }, [searchText, JSON.stringify(univs), selectedUniv]);

  return {
    isLoading,
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
