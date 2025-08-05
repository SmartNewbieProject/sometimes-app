import BottomArrowIcon from "@assets/icons/bottom-arrow.svg";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSignupProgress } from "../../hooks";

const GRADE_LIST = ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"];

function GradeSelector() {
  const {
    form: { grade },
    updateForm,
  } = useSignupProgress();

  const [isVisible, setIsVisible] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openOptions = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: 166,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeOptions = () => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => setIsVisible(false));
  };

  const toggleOptions = () => {
    isVisible ? closeOptions() : openOptions();
  };

  const handleSelect = (grade: string) => {
    updateForm({ grade });
    closeOptions();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleOptions} style={styles.selector}>
        <Text style={styles.selectorText}>{grade ?? "학년 선택"}</Text>
        <View style={styles.checkBox}>
          <BottomArrowIcon width={13} height={8} />
        </View>
      </Pressable>

      {isVisible && (
        <Animated.View
          style={[
            styles.optionList,
            {
              height: heightAnim,
              opacity: opacityAnim,
              overflow: "hidden",
            },
          ]}
        >
          {GRADE_LIST.map((grade) => (
            <Pressable
              key={grade}
              onPress={() => handleSelect(grade)}
              style={styles.option}
            >
              <Text style={styles.optionText}>{grade}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  selector: {
    width: 132,
    height: 37,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#7A3AE2",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: {
    color: "BAB0D0",
    fontSize: 15,
    fontWeight: 300,
    fontFamily: "Pretendard-Thin",
    lineHeight: 18.9,
    marginLeft: 12,
  },
  checkBox: {
    marginRight: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: 25,
    height: 25,
    backgroundColor: "#E2D9FF",
  },
  optionList: {
    paddingVertical: 11,
    paddingHorizontal: 13,
    position: "absolute",
    top: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#7A4AE2",
    backgroundColor: "#FFF",
    width: 132,
    maxHeight: 214,
  },
  option: {
    paddingVertical: 4,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 15.6,
    color: "#BAB0D0",
  },
});

export default GradeSelector;
