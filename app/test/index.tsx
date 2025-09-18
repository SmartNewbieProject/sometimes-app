import React, { useState, useCallback } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import {
  type AnimationPatternName,
  useAnimation,
  usePresetAnimation,
} from "reanimated-composer";
// 버튼으로 만들 패턴 목록
const entrancePatterns: AnimationPatternName[] = [
  "fadeIn",
  "slideInUp",
  "slideInDown",
  "slideInLeft",
  "slideInRight",
  "zoomIn",
  "bounceIn",
];
const emphasisPatterns: AnimationPatternName[] = ["shake", "pulse", "jiggle"];
const exitPatterns: AnimationPatternName[] = [
  "fadeOut",
  "slideOutUp",
  "slideOutDown",
  "slideOutLeft",
  "slideOutRight",
  "zoomOut",
];

const AnimationShowcase = () => {
  // 현재 선택된 애니메이션 패턴의 이름을 저장
  const [currentPattern, setCurrentPattern] =
    useState<AnimationPatternName>("fadeIn");

  // 등장/퇴장 애니메이션을 위한 `boolean` 트리거
  const [isVisible, setIsVisible] = useState(true);

  // 강조 애니메이션을 위한 `number` 트리거 (값이 바뀔 때마다 실행)
  const [emphasisTrigger, setEmphasisTrigger] = useState(0);

  // 현재 패턴이 강조 애니메이션인지 확인
  const isEmphasis = emphasisPatterns.includes(currentPattern);

  // 패턴 종류에 따라 적절한 trigger 값을 선택
  const trigger = isEmphasis ? emphasisTrigger : isVisible;

  // 훅을 사용하여 현재 선택된 패턴에 대한 애니메이션 스타일을 가져옴
  const { animatedStyle, reset } = usePresetAnimation(currentPattern, {
    trigger,
    onComplete: () => {
      console.log(`${currentPattern} animation completed!`);
      // 퇴장 애니메이션이 끝나면 isVisible 상태를 false로 확실하게 변경
      if (exitPatterns.includes(currentPattern)) {
        setIsVisible(false);
      }
    },
  });

  // 등장/퇴장 버튼 핸들러
  const handleEntranceExitPress = useCallback(
    (pattern: AnimationPatternName) => {
      setCurrentPattern(pattern);
      // 현재 보이지 않는 상태라면, 먼저 보이도록 상태를 바꾸고 애니메이션 실행
      if (!isVisible) {
        setIsVisible(true);
      } else {
        // 이미 보이는 상태라면, 퇴장 애니메이션을 위해 상태 변경
        setIsVisible(false);
      }
    },
    [isVisible]
  );

  // 강조 버튼 핸들러
  const handleEmphasisPress = useCallback(
    (pattern: AnimationPatternName) => {
      // 강조 애니메이션은 항상 보이는 상태에서 실행
      if (!isVisible) {
        setIsVisible(true);
      }
      setCurrentPattern(pattern);
      setEmphasisTrigger((c) => c + 1); // 트리거 값을 변경하여 애니메이션 재실행
    },
    [isVisible]
  );

  // 박스 리셋 버튼 핸들러
  const handleReset = () => {
    setIsVisible(true);
    setCurrentPattern("fadeIn");
    reset(); // 훅에서 반환된 reset 함수 호출
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.currentPatternText}>Current: {currentPattern}</Text>
        <Button title="Reset Box" onPress={handleReset} />
      </View>

      <View style={styles.animationContainer}>
        {/* isVisible이 true이거나, 퇴장 애니메이션일 때만 박스를 렌더링 */}
        {(isVisible || exitPatterns.includes(currentPattern)) && (
          <Animated.View style={[styles.box, animatedStyle]}>
            <Text style={styles.boxText}>BOX</Text>
          </Animated.View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.buttonGroup}>
          <Text style={styles.groupTitle}>Entrance</Text>
          {entrancePatterns.map((name) => (
            <View style={styles.buttonWrapper} key={name}>
              <Button
                title={name}
                onPress={() => handleEntranceExitPress(name)}
              />
            </View>
          ))}
        </View>

        <View style={styles.buttonGroup}>
          <Text style={styles.groupTitle}>Emphasis</Text>
          {emphasisPatterns.map((name) => (
            <View style={styles.buttonWrapper} key={name}>
              <Button title={name} onPress={() => handleEmphasisPress(name)} />
            </View>
          ))}
        </View>

        <View style={styles.buttonGroup}>
          <Text style={styles.groupTitle}>Exit</Text>
          {exitPatterns.map((name) => (
            <View style={styles.buttonWrapper} key={name}>
              <Button
                title={name}
                onPress={() => handleEntranceExitPress(name)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  currentPatternText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  animationContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 120,
    height: 120,
    backgroundColor: "tomato",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  boxText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollContainer: {
    padding: 20,
  },
  buttonGroup: {
    marginBottom: 30,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  buttonWrapper: {
    marginVertical: 5,
  },
});

export default AnimationShowcase;
