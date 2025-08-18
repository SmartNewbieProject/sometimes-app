import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

const universityLogos = [
  require("@/assets/images/univ/cheonan/caschu.png"),
  require("@/assets/images/univ/busan/pnu.png"),
  require("@/assets/images/univ/daegu/dgcau.png"),

  require("@/assets/images/univ/busan/kmou.png"),
  require("@/assets/images/univ/daegu/dgdart.png"),
  require("@/assets/images/univ/incheon/icninu.png"),

  require("@/assets/images/univ/busan/dau.png"),
  require("@/assets/images/univ/daegu/dgdau.png"),
  require("@/assets/images/univ/incheon/icninu.png"),

  require("@/assets/images/univ/busan/ksu.png"),
  require("@/assets/images/univ/daegu/dgdhu.png"),
  require("@/assets/images/univ/incheon/icninha.png"),

  require("@/assets/images/univ/daejeon/hbu.png"),
  require("@/assets/images/univ/busan/deu.png"),
  require("@/assets/images/univ/daegu/dgkit.png"),

  require("@/assets/images/univ/daejeon/hnu.png"),
  require("@/assets/images/univ/busan/ku.png"),
  require("@/assets/images/univ/daegu/dgkmu.png"),

  require("@/assets/images/univ/daejeon/kaist.png"),
  require("@/assets/images/univ/busan/dsu.png"),
  require("@/assets/images/univ/daegu/dgknu.png"),

  require("@/assets/images/univ/daejeon/kyu.png"),
  require("@/assets/images/univ/busan/tmu.png"),
  require("@/assets/images/univ/daegu/dgynu.png"),

  require("@/assets/images/univ/incheon/icngcu.png"),
  require("@/assets/images/univ/busan/cup.png"),
  require("@/assets/images/univ/cheonan/cabu.png"),

  require("@/assets/images/univ/daejeon/uju.png"),
  require("@/assets/images/univ/busan/pknu.png"),
  require("@/assets/images/univ/cheonan/cabu.png"),

  require("@/assets/images/univ/daejeon/wsu.png"),
  require("@/assets/images/univ/busan/pnue.png"),
  require("@/assets/images/univ/cheonan/caknu.png"),
];

const firstRowLogos = universityLogos.slice(0, 12);
const secondRowLogos = [...universityLogos].reverse();

interface UniversityLogosProps {
  logoSize?: number;
}

export default function UniversityLogos({
  logoSize = 48,
}: UniversityLogosProps) {
  const firstRowAnim = useRef(new Animated.Value(0)).current;
  const secondRowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const logoWithMargin = logoSize + 8;
    const singleSetWidth = firstRowLogos.length * logoWithMargin;

    const animateFirstRow = () => {
      firstRowAnim.setValue(0);
      Animated.timing(firstRowAnim, {
        toValue: -singleSetWidth,
        duration: 20000,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start(animateFirstRow);
    };

    animateFirstRow();
    return () => firstRowAnim.stopAnimation();
  }, [firstRowAnim, logoSize]);

  useEffect(() => {
    const logoWithMargin = logoSize + 8;
    const singleSetWidth = secondRowLogos.length * logoWithMargin;

    const animateSecondRow = () => {
      secondRowAnim.setValue(-singleSetWidth);
      Animated.timing(secondRowAnim, {
        toValue: 0,
        duration: 20000,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start(animateSecondRow);
    };

    animateSecondRow();
    return () => secondRowAnim.stopAnimation();
  }, [secondRowAnim, logoSize]);

  const renderLogoRow = (logos: number[], animatedValue: Animated.Value) => {
    const logoWithMargin = logoSize + 8;
    const singleSetWidth = logos.length * logoWithMargin;

    return (
      <View style={{ height: logoSize, marginBottom: 12, overflow: "hidden" }}>
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            transform: [{ translateX: animatedValue }],
            width: singleSetWidth * 2, // 원본 + 복사본으로 2배 크기
            height: logoSize,
          }}
        >
          {[...logos, ...logos].map((logo, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              style={{
                width: logoSize,
                height: logoSize,
                marginHorizontal: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={logo}
                style={{ width: logoSize, height: logoSize }}
                contentFit="contain"
              />
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{ width: "100%", paddingBottom: 46, position: "relative" }}>
      {renderLogoRow(firstRowLogos, firstRowAnim)}
      {renderLogoRow(secondRowLogos, secondRowAnim)}

      {/* 왼쪽 페이드 오버레이 */}
      <LinearGradient
        colors={["rgba(247, 243, 255, 1)", "rgba(247, 243, 255, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          left: 0,
          top: 16,
          bottom: 16,
          width: 40,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* 오른쪽 페이드 오버레이 */}
      <LinearGradient
        colors={["rgba(247, 243, 255, 0)", "rgba(247, 243, 255, 1)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          right: 0,
          top: 16,
          bottom: 16,
          width: 40,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    </View>
  );
}
