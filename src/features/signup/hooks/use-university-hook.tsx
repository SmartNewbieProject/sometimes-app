import Signup from "@features/signup";
import {
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { filterUniversities } from "../lib";
import useUniversities from "../queries/use-universities";
const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  queries,
  useSignupAnalytics,
} = Signup;
const { useUnivQuery } = queries;
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

  const onNext = (fallback: () => void) => {
    if (!selectedUniv) {
      return;
    }
    trackSignupEvent("next_button_click", "to_university_details");
    updateForm({
      ...userForm,
      universityId: selectedUniv,
    });
    fallback();
  };

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
    onNext,
    handleClickUniv,
    selectedUniv,
    regions,
  };
}

const styles = StyleSheet.create({});

export default useUniversityHook;
