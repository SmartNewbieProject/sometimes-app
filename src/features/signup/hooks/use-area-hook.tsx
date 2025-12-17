import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRegionList } from "../lib";
import useChangePhase from "./use-change-phase";
import { useSignupAnalytics } from "./use-signup-analytics";
import useSignupProgress, { SignupSteps } from "./use-signup-progress";

function useAreaHook() {
  const { t } = useTranslation();
  const [show, setShow] = useState<null | string>(null);
  const [initDisabled, setInitDisabled] = useState(true);
  const params = useLocalSearchParams();
  const hasProcessedPassInfo = useRef(false);
  const {
    updateForm,
    form: userForm,
    updateUnivTitle,
    updateRegions,
  } = useSignupProgress();
  // useChangePhase(SignupSteps.AREA);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics("area");

  useEffect(() => {
    updateRegions([]);
  }, []);

  // 보안: AsyncStorage에서 certificationInfo를 읽어옴 (URL에서 제거)
  useEffect(() => {
    const loadCertificationInfo = async () => {
      if (hasProcessedPassInfo.current) return;

      try {
        const certInfoStr = await AsyncStorage.getItem('signup_certification_info');
        if (certInfoStr) {
          hasProcessedPassInfo.current = true;
          const certInfo = JSON.parse(certInfoStr);
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
      } catch (error) {
        console.error('Failed to load certification info:', error);
      }
    };

    loadCertificationInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setShow("대구");
    }, 200);

    setTimeout(() => {
      setShow("서울/인천/경기");
    }, 700);

    setTimeout(() => {
      setShow(null);
      setInitDisabled(false);
    }, 1200);
  }, []);

  const onNext = (fallback: () => void) => {
    if (!show) {
      return;
    }
    trackSignupEvent("next_button_click", "to_university");
    updateUnivTitle(`${show}${t("features.signup.ui.area.university_suffix")}`);

    fallback();

    return;
  };

  const handleShowNull = () => {
    setShow(null);
  };

  const handleChangeShow = (area: string) =>
    setShow((prev) => (prev === area ? null : area));

  return {
    onNext,
    show,
    initDisabled,
    handleChangeShow,
    handleShowNull,
  };
}

export default useAreaHook;