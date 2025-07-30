import { DefaultLayout } from "@/src/features/layout/ui";
import {
  SignupSteps,
  useChangePhase,
  useSignupAnalytics,
  useSignupProgress,
} from "@/src/features/signup/hooks";
import { areaMap } from "@/src/features/signup/lib";
import { getRegionList } from "@/src/features/signup/lib/area";
import Heart from "@/src/features/signup/ui/area/heart";
import AreaModal from "@/src/features/signup/ui/area/modal";
import { Button, Header, Text } from "@/src/shared/ui";
import AreaFillHeart from "@assets/icons/area-fill-heart.svg";
import ChevronLeftIcon from "@assets/icons/chevron-left.svg";
import DokdoIcon from "@assets/icons/dokdo.svg";
import { Image } from "expo-image";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  Text as RNText,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function Area() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.certificationInfo]);

  useEffect(() => {
    setShow("대전");

    setTimeout(() => {
      setShow("부산");
    }, 1000);
    setTimeout(() => {
      setShow(null);
      setInitDisabled(false);
    }, 2000);
  }, []);

  const onNext = () => {
    if (!show) {
      return;
    }
    trackSignupEvent("next_button_click", "to_university");
    updateUnivTitle(`${show} 대학`);
    updateRegions(getRegionList(show));
    router.push("/auth/signup/university");
  };

  return (
    <DefaultLayout
      style={{
        paddingTop: insets.top,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
      }}
    >
      <View>
        <Text
          size="20"
          weight="semibold"
          textColor={"black"}
          style={styles.title}
        >
          어느 지역에서 만남을 시작할까요?
        </Text>
        <Text size="13" weight="light" textColor={"light"} style={styles.desc}>
          현재 거주하거나 학교가 있는 지역을 선택해주세요
        </Text>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.mapContainer}>
          <Image
            source={require("@assets/images/heart-balloon.png")}
            style={{
              width: 57,
              height: 54,
              position: "absolute",
              top: -10,
              left: -18,
            }}
          />
          <Image
            source={require("@assets/images/heart-arrow.png")}
            style={{
              width: 72,
              height: 72,
              position: "absolute",
              bottom: 20,
              right: -10,
              transform: [
                {
                  rotate: "13deg",
                },
              ],
            }}
          />
          <DokdoIcon
            width={10}
            height={10}
            style={{ position: "absolute", right: -16, top: 86 }}
          />

          <Image
            source={require("@assets/images/korea-map.png")}
            style={{ width: 280, height: 438 }}
          />

          {areaMap.map(({ id, area, location, open }) => (
            <View
              key={`heart-${id}`}
              style={{
                position: "absolute",
                alignItems: "center",
                gap: 10,
                zIndex: 1,
                ...location,
              }}
            >
              <Heart
                open={open}
                isPick={show === area}
                onClick={() => setShow((prev) => (prev === area ? null : area))}
              />
            </View>
          ))}
          {show !== null &&
            areaMap.map(({ id, area, modalLocation, description, open }) => (
              <View
                key={`modal-${id}`}
                style={{
                  position: "absolute",
                  alignItems: "center",
                  zIndex: 2,
                  ...modalLocation,
                }}
              >
                <AreaModal
                  open={open}
                  area={area}
                  description={description}
                  isShow={show === area}
                />
              </View>
            ))}
        </View>
      </View>
      <View
        style={[styles.bottomContainer, { paddingBottom: 34 + insets.bottom }]}
        className="w-[calc(100%-32px)]"
      >
        <View style={styles.tipConatainer}>
          <AreaFillHeart width={20} height={20} />

          <RNText style={styles.tip}>
            하트를 눌러 지역을 선택하고 오픈 현황을 확인하세요!
          </RNText>
        </View>
        <Button
          onPress={onNext}
          disabled={
            initDisabled ||
            !(
              show &&
              !!areaMap.find(
                (area) => area.area === show && area.open === "open"
              )
            )
          }
          className="w-full"
          variant={"primary"}
          size="md"
        >
          이 지역으로 시작하기
        </Button>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    lineHeight: 24,

    marginBottom: 10,
  },
  desc: {
    lineHeight: 16,
    marginBottom: 16,
  },
  mapContainer: {
    position: "relative",
    width: 280,
    height: 438,
    marginRight: 34,
    zIndex: 0,
  },
  contentContainer: {
    flex: 1,

    position: "relative",
    alignItems: "center",
    marginTop: 34,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    paddingTop: 16,
  },
  tipConatainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 16,
  },
  tip: {
    color: "#9B94AB",
    fontWeight: 300,
    fontFamily: "Pretendard-Thin",
    fontSize: 13,

    lineHeight: 20,
  },
});

export default Area;
