import { DefaultLayout } from "@/src/features/layout/ui";
import type React from "react";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SlideProps {
  children: React.ReactNode[];
  className?: string;
  indicatorClassName?: string;
  activeIndicatorClassName?: string;
  indicatorContainerClassName?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicator?: boolean;
  indicatorPosition?: "top" | "bottom";

  onSlideChange?: (index: number) => void;
  onScrollStateChange?: (isScrolling: boolean) => void;
  animationDuration?: number;
}
function Slider() {
  const array = [3, 0, 1, 2, 3, 0];
  const [focusIndex, setFocusIndex] = useState<number>(1);
  const width = 300;
  const bannerAnim = useRef(new Animated.Value(-width)).current;
  const pendingRef = useRef(true);
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const toRight = gestureState.dx < -80;
      const toLeft = gestureState.dx > 80;
      if (toRight && pendingRef.current) {
        pendingRef.current = false;
        console.log("to right", focusIndex, array);
        if (focusIndex === array.length - 2) {
          console.log("check point");
          setFocusIndex((prev) => 1);
          Animated.timing(bannerAnim, {
            toValue: -(array.length - 1) * width,
            useNativeDriver: true,
            duration: 500,
          }).start(({ finished }) => {
            if (finished) {
              console.log("focusIndex", focusIndex);

              console.log("focusIndex to Right", focusIndex);
              bannerAnim.setValue(-width);

              pendingRef.current = true;
            }
          });
          return;
        }

        setFocusIndex((prev) => (prev === array.length - 2 ? 0 : prev + 1));

        Animated.timing(bannerAnim, {
          toValue: -(focusIndex + 1) * width,
          useNativeDriver: true,
          duration: 500,
        }).start(({ finished }) => {
          if (finished) {
            pendingRef.current = true;
          }
        });
      }
      if (toLeft && pendingRef.current) {
        pendingRef.current = false;
        if (focusIndex === 1) {
          console.log("check point2");
          setFocusIndex((prev) => array.length - 2);

          Animated.timing(bannerAnim, {
            toValue: 0,
            useNativeDriver: true,
            duration: 500,
          }).start(({ finished }) => {
            if (finished) {
              bannerAnim.setValue(-(array.length - 2) * width);

              pendingRef.current = true;
            }
          });
          return;
        }
        setFocusIndex((prev) => (prev === 1 ? array.length - 2 : prev - 1));
        Animated.timing(bannerAnim, {
          toValue: -(focusIndex - 1) * width,
          useNativeDriver: true,
          duration: 500,
        }).start(({ finished }) => {
          if (finished) {
            pendingRef.current = true;
          }
        });
      }
    },
  });
  const onButtonNavigation = (index: number) => {
    setFocusIndex(index + 1);
    Animated.timing(bannerAnim, {
      toValue: -(index + 1) * width,
      useNativeDriver: true,
      duration: 500,
    }).start();
  };

  return (
    <DefaultLayout>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            width: width,
            height: width + 40,
            overflow: "hidden",
            position: "relative",
            paddingBottom: 60,
          }}
        >
          <Animated.View
            style={{
              flexDirection: "row",
              left: 0,

              overflow: "hidden",
              marginHorizontal: "auto",

              position: "absolute",
              transform: [{ translateX: bannerAnim }],
            }}
          >
            {array.map((value, index) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                style={{
                  width,
                  height: width,
                  backgroundColor: "#ffa100",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 50, color: "#ffffff" }}>{value}</Text>
              </View>
            ))}
          </Animated.View>
          {/* 인디케이터 */}
          <View
            style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}
          >
            {[...array.slice(1, array.length - 1)].map((value, index) => (
              <Pressable // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                style={{
                  height: width,
                  marginTop: 40,
                  justifyContent: "flex-end",
                }}
                onPress={() => onButtonNavigation(index)}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                    backgroundColor:
                      focusIndex === index + 1 ? "#ffa100" : "#ffa10050",
                  }}
                />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({});

export default Slider;
