import BottomArrowIcon from "@assets/icons/bottom-arrow.svg";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSignupProgress } from "../../hooks";

const NUMBER_LIST = [
  "25학번",
  "24학번",
  "23학번",
  "22학번",
  "21학번",
  "20학번",
  "19학번",
  "직접 입력하기",
];

function StudentIdSelector() {
  const inputRef = useRef<null | TextInput>(null);
  const {
    form: { studentNumber, grade },
    updateForm,
  } = useSignupProgress();

  const [isInput, setInput] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openOptions = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: 214,
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
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const toggleOptions = () => {
    if (isVisible) closeOptions();
    else openOptions();
  };

  const handleSelect = (number: string) => {
    if (number === "직접 입력하기") {
      setInput(true);
      inputRef?.current?.focus();
      closeOptions();
      return;
    }

    // 학번 숫자 추출
    const yearPrefix = number.slice(0, 2);
    const yearNumber = Number.parseInt(yearPrefix, 10);
    const currentFullYear = new Date().getFullYear();
    const entryYear = 2000 + yearNumber;
    const calculatedGrade = Math.min(
      Math.max(currentFullYear - entryYear + 1, 1),
      6
    );

    updateForm({
      studentNumber: number,
      ...(grade === undefined && !Number.isNaN(calculatedGrade)
        ? { grade: `${calculatedGrade}학년` }
        : {}),
    });

    setInput(false);
    closeOptions();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleOptions} style={styles.selector}>
        {isInput ? (
          <TextInput
            ref={inputRef}
            placeholder="학번 선택"
            value={studentNumber}
            onChangeText={(text: string) => updateForm({ studentNumber: text })}
            style={[styles.selectorText, { maxWidth: 60 }]}
          />
        ) : (
          <Text style={styles.selectorText}>
            {studentNumber ?? "학번 선택"}
          </Text>
        )}
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
          {NUMBER_LIST.map((number) => (
            <Pressable
              key={number}
              onPress={() => handleSelect(number)}
              style={styles.option}
            >
              <Text style={styles.optionText}>{number}</Text>
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
    flex: 1,
    outline: "none",
    borderWidth: 0,
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

export default StudentIdSelector;
