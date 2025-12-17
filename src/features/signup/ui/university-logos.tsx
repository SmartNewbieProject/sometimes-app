import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

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
];

const moreLogos = [
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
];

interface UniversityLogosProps {
  logoSize?: number;
}

export default function UniversityLogos({
  logoSize = 48,
}: UniversityLogosProps) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const width = universityLogos.length * (logoSize + 8);

    const animate1 = () => {
      anim1.setValue(0);
      Animated.timing(anim1, {
        toValue: -width,
        duration: 20000,
        useNativeDriver: Platform.OS !== 'web',
        easing: Easing.linear,
      }).start(animate1);
    };

    animate1();
    return () => anim1.stopAnimation();
  }, [anim1, logoSize]);

  useEffect(() => {
    const width = moreLogos.length * (logoSize + 8);

    const animate2 = () => {
      anim2.setValue(-width);
      Animated.timing(anim2, {
        toValue: 0,
        duration: 20000,
        useNativeDriver: Platform.OS !== 'web',
        easing: Easing.linear,
      }).start(animate2);
    };

    animate2();
    return () => anim2.stopAnimation();
  }, [anim2, logoSize]);

  const logoWithMargin = logoSize + 8;

  return (
    <View style={styles.container}>
      <View style={styles.rowsContainer}>
        {/* Row 1 */}
        <View testID="logo-row-1" style={[styles.row, { height: logoWithMargin }]}>
          <Animated.View
            style={[
              styles.animatedRow,
              {
                transform: [{ translateX: anim1 }],
                width: universityLogos.length * logoWithMargin * 2,
              },
            ]}
          >
            {[...universityLogos, ...universityLogos].map((logo, idx) => (
              <View
                key={`row1-${idx}`}
                style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
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

        {/* Row 2 */}
        <View testID="logo-row-2" style={[styles.row, { height: logoWithMargin, marginTop: 12 }]}>
          <Animated.View
            style={[
              styles.animatedRow,
              {
                transform: [{ translateX: anim2 }],
                width: moreLogos.length * logoWithMargin * 2,
              },
            ]}
          >
            {[...moreLogos, ...moreLogos].map((logo, idx) => (
              <View
                key={`row2-${idx}`}
                style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
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
      </View>

      {/* Left Gradient */}
      <LinearGradient
        colors={["rgba(247, 243, 255, 1)", "rgba(247, 243, 255, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientLeft}
        pointerEvents="none"
      />

      {/* Right Gradient */}
      <LinearGradient
        colors={["rgba(247, 243, 255, 0)", "rgba(247, 243, 255, 1)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientRight}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 20,
    paddingBottom: 46,
    position: "relative",
    minHeight: 200,
  },
  rowsContainer: {
    width: "100%",
  },
  row: {
    overflow: "hidden",
    width: "100%",
  },
  animatedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 2,
  },
  gradientRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 2,
  },
});
