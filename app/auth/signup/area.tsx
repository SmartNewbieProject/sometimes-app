import { DefaultLayout } from "@/src/features/layout/ui";

import useAreaHook from "@/src/features/signup/hooks/use-area-hook";
import { areaMap } from "@/src/features/signup/lib";
import Heart from "@/src/features/signup/ui/area/heart";
import AreaModal from "@/src/features/signup/ui/area/modal";

import { Button, Header, Text } from "@/src/shared/ui";
import { track } from "@amplitude/analytics-react-native";
import AreaFillHeart from "@assets/icons/area-fill-heart.svg";
import DokdoIcon from "@assets/icons/dokdo.svg";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  BackHandler,
  Platform,
  Pressable,
  Text as RNText,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function Area() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { onNext, show, initDisabled, handleChangeShow, handleShowNull } =
    useAreaHook();
  const router = useRouter();

  const handleNext = () => {
    onNext(() => {
      track("Signup_area", {
        area: show,
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
      router.push(`/auth/signup/university?area=${show}`);
    });
  };

  return (
    <DefaultLayout
      style={{
        backgroundColor: "#fff",
      }}
    >
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          size="20"
          weight="semibold"
          textColor={"black"}
          style={styles.title}
        >
          {t("apps.auth.sign_up.area.title")}
        </Text>
        <Text size="13" weight="light" textColor={"light"} style={styles.desc}>
          <Text size="13" weight="light" textColor={"light"} style={styles.desc}>
          {t("apps.auth.sign_up.area.desc")}
        </Text>
        </Text>
      </View>
      <ScrollView>
        <Pressable onPress={handleShowNull} style={styles.contentContainer}>
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
                  onClick={() => handleChangeShow(area)}
                />
              </View>
            ))}
            {show !== null &&
              (areaMap ?? []).map(
                ({ id, area, modalLocation, description, open }) => (
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
                )
              )}
          </View>
        </Pressable>
      </ScrollView>
      <View
        style={[
          styles.bottomContainer,
          {
            paddingBottom:
              Platform.OS === "web" ? 18 + insets.bottom : 6 + insets.bottom,
          },
        ]}
      >
        <View style={styles.tipConatainer}>
          <AreaFillHeart width={20} height={20} />

          <RNText style={styles.tip}>
            {t("apps.auth.sign_up.area.tip")}
          </RNText>
        </View>
        <Button
          onPress={handleNext}
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
          size="md"
        >
          {t("apps.auth.sign_up.area.button")}
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
    paddingBottom: 120,
    paddingTop: 20,
    position: "relative",
    alignItems: "center",
    marginTop: 10,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    width: "100%",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
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
    fontFamily: "thin",
    fontSize: 13,

    lineHeight: 20,
  },
});

export default Area;