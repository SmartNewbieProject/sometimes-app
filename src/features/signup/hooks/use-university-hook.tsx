import Signup from "@features/signup";
import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
    userForm.universityName
  );
  const [filteredUniv, setFilteredUniv] = useState(univs);

  useChangePhase(SignupSteps.UNIVERSITY);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics("university");

  const onNext = (fallback: () => void) => {
    if (!selectedUniv) {
      return;
    }
    trackSignupEvent("next_button_click", "to_university_details");
    updateForm({
      ...userForm,
      universityName: selectedUniv,
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
