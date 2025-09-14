import { track } from "@amplitude/analytics-react-native";
import Signup from "@features/signup";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { useAnimation } from "reanimated-composer";
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

  const [filteredUniv, setFilteredUniv] = useState(univs);
  const { updateShowHeader, showHeader, updateRegions, updateUnivTitle } =
    useSignupProgress();
  const [isFocused, setIsFocused] = useState(false);
  const { animatedStyle: animatedTitleStyle } = useAnimation({
    trigger: isFocused,

    animations: {
      opacity: {
        initial: 1,
        to: 0,
        enter: { duration: 0 },
        exit: { duration: 0, delay: 350 },
      },
    },
  });

  const { animatedStyle: animatedContainerStyle } = useAnimation({
    trigger: isFocused,
    animations: {
      translateY: {
        initial: 60,
        to: 0,
        enter: { duration: 350 },
        exit: { duration: 0 },
      },
    },
  });

  const { animatedStyle: animatedListStyle } = useAnimation({
    trigger: isFocused,
    animations: {
      opacity: {
        initial: 0,
        to: 1,
        enter: { duration: 350 },
        exit: { duration: 0 },
      },
      translateY: {
        initial: 50,
        to: 0,
        enter: { duration: 350 },
        exit: { duration: 0 },
      },
    },
  });
  const selectedUnivObj = filteredUniv?.find(
    (item) => item.id === selectedUniv
  );
  const handleFocus = () => {
    if (!isFocused) {
      setIsFocused(true);
      updateShowHeader(true);
    }
  };

  const onBackPress = (fallback: () => void) => {
    if (isFocused) {
      setIsFocused(false);
      setSearchText("");
      Keyboard.dismiss();
      updateShowHeader(false);
    } else {
      fallback();
    }
    return true;
  };

  const handleBlur = () => {
    setIsFocused(false);
    updateShowHeader(false);
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
    setIsFocused;
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
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.certificationInfo]);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics("university");

  const handleClickUniv = (univ: string) => () => {
    setSelectedUniv((prev) => (prev === univ ? undefined : univ));
  };

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
    handleFocus,
    handleBlur,
    onNext,
    onBackPress,
    isFocused,
  };
}

const styles = StyleSheet.create({});

export default useUniversityHook;
