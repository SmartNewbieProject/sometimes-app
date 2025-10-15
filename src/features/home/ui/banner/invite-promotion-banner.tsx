import BannerRightArrowIcon from "@assets/images/promotion/home-banner/right-arrow.svg";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
function InvitePromotionBanner() {
  const translateXAnim = useSharedValue(0);
  const router = useRouter();
  useEffect(() => {
    translateXAnim.value = withRepeat(
      withTiming(3, {
        duration: 400,
        easing: Easing.out(Easing.circle),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateXAnim.value }],
    };
  });

  const handlePromotion = () => {
    router.push("/purchase/gem-store");
  };

  return (
    <LinearGradient colors={["#7A4AE2", "#43297C"]} start={{x: 0, y: 1}} end={{x: 1, y: 0}} locations={[0.2, 1]} style={styles.container}>
      <Image
        source={require("@assets/images/promotion/home-banner/particle-left.png")}
        style={styles.particleLeft}
      />
       <Image
        source={require("@assets/images/promotion/home-banner/particle-right.png")}
        style={styles.particleRight}
      />
       <Image
        source={require("@assets/images/promotion/home-banner/coupon-miho.png")}
        style={styles.couponMiho}
          />  
    
      <Pressable onPress={handlePromotion} style={styles.flexContainer}>
        <View style={styles.imageContainer} >
           <Image
        source={require("@assets/images/promotion/home-banner/gem.png")}
        style={styles.image}
          />
           <Image
        source={require("@assets/images/promotion/home-banner/star3.png")}
        style={styles.star3}
          />
             <Image
        source={require("@assets/images/promotion/home-banner/star4.png")}
        style={styles.star4}
      />
        </View>
       
      <View style={styles.content}>
          <Text style={[styles.title]}>친구 초대하면,</Text>
          <View style={styles.bottomContainer}>
           <Text style={styles.title}>나도 친구도</Text>
            <View style={[styles.titleStrongContainer]}>
              
             <Image
        source={require("@assets/images/promotion/home-banner/star5.png")}
        style={styles.star5}
              />
                  
             <Image
        source={require("@assets/images/promotion/home-banner/star6.png")}
        style={styles.star6}
              />
                <Image
        source={require("@assets/images/promotion/home-banner/letter.png")}
        style={styles.letter}
      />
            <Text style={styles.titleStrong}>50구슬</Text>
          </View>
          </View>
         
      </View>
      <View style={styles.button}>
        <Animated.View style={[animatedStyle, { left: -2 }]}>
          <BannerRightArrowIcon  />
          </Animated.View>
          <Text style={styles.inviteText}>초대하러 가기</Text>
        </View>
        </Pressable>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    width: "99%",
    minHeight: 90,
    overflow: "hidden",
  
    
  },
  flexContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 90
  },
  image: {
     marginLeft: 6,
    width: 54,
    height: 54,
  },
  imageContainer: {
    position: "relative",
  
  },
  star3: {
    position: "absolute",
    width: 19,
    height: 17,
    top: 3,
    left: 12
  },
    star4: {
    position: "absolute",
    width: 20,
    height: 20,
    top: 10,
    left: 6
  },
     star5: {
    position: "absolute",
    width: 20,
    height: 20,
    top: -11,
    left: -12
  },
      star6: {
    position: "absolute",
    width: 20,
    height: 20,
    bottom: -8,
    right: -13
  },
  letter: {
    position: "absolute",
    width: 28,
    height: 28,
    bottom: 4,
    right: -24
  },
  content: {
    gap: 4,
    flex: 1,
    
  },
  title: {
    fontWeight: 600,
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 18,
    color: "#FFFFFF",
  },
  topTitle: {
    opacity: 0.9
  },
  bottomTitle: {
    marginTop: 6
  },
  titleStrongContainer: {
    position: "relative"
  },
  titleStrong: {
    fontWeight: 800,
    fontSize: 18,
    lineHeight: 21.6,
    fontFamily: "Pretendard-ExtraBold",
    color: "#FFFFFF",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8
 },
  button: {
    width: 85,
    marginTop: 40,
    flexDirection: "row",
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 2.5,
    backgroundColor: "#fff",
    marginRight: 19,
  },
  particleLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 190,
    height: 90,
  },
    particleRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 206,
    height: 90,
  },
  couponMiho: {
       position: "absolute",
    top: 0,
    right: 24,
    width: 120,
    height: 90,
    },

  inviteText: {
    color: "#212121",
    fontWeight: 700,
    fontFamily: "Pretendard-Bold",
    lineHeight: 15,
    fontSize: 10,
    letterSpacing: -0.03,
    marginTop: 2,
  }
});

export default InvitePromotionBanner;
