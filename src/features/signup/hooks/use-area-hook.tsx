import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { getRegionList } from "../lib";
import useChangePhase from "./use-change-phase";
import { useSignupAnalytics } from "./use-signup-analytics";
import useSignupProgress, { SignupSteps } from "./use-signup-progress";

function useAreaHook() {
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
  useChangePhase(SignupSteps.AREA);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics("area");

  useEffect(() => {
    updateRegions([]);
  }, []);

  // PASS 인증 정보 처리 (useRef로 한 번만 실행되도록 제어)
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

  useEffect(() => {
    setTimeout(() => {
      setShow("대전");
    }, 200);

    setTimeout(() => {
      setShow("부산");
    }, 700);
    setTimeout(() => {
      setShow("대구");
    }, 1200);
    setTimeout(() => {
      setShow("충청/세종");
    }, 1700);
    setTimeout(() => {
      setShow(null);
      setInitDisabled(false);
    }, 2200);
  }, []);

  const onNext = (fallback: () => void) => {
    if (!show) {
      return;
    }
    trackSignupEvent("next_button_click", "to_university");
    updateUnivTitle(`${show} 대학`);
    updateRegions(getRegionList(show));

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
