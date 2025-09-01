import BulbIcon from "@assets/icons/bulb.svg";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const GUIDE_TEXT = [
  "요즘 가장 관심있게 보고 있는 드라마나 예능 이 있나요?",
  "주말에 주로 뭐 하면서 시간 보내세요?",
  "안녕하세요! 프로필에서 카페투어를 좋아한다고 하셨는데, 추천하고 싶은 카페가 있나요?",
  "동아리나 학회 활동 하고 계신가요?",
  "OO학과라고 하셨는데, 어떤 분야에 관심이 있으신가요?",
  "동아리나 학회 활동 하고 계신가요?",
  "방학동안에 어떤 활동하면서 지내셨나요?",
];

function ChatGuideBanner() {
  const guideList = getRandomItems(GUIDE_TEXT, 2);
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <BulbIcon />
        <Text style={styles.title}>대화 시작 도우미</Text>
      </View>
      <View style={styles.bottomContainer}>
        {guideList.map((item) => (
          <View key={item} style={styles.guideContainer}>
            <Text style={styles.guideText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#73727566",
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  title: {
    color: "#737275",
    fontSize: 15,
    lineHeight: 22,
  },
  guideContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#FBF9FF",
  },
  guideText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#737275",
  },
  bottomContainer: {
    marginTop: 12,
    gap: 4,
    paddingHorizontal: 7,
  },
});

function getRandomItems(arr: string[], count: number) {
  const uniqueArr = [...new Set(arr)];

  const result: string[] = [];

  while (result.length < count) {
    const randomIndex = Math.floor(Math.random() * uniqueArr.length);
    const randomItem = uniqueArr[randomIndex];

    if (!result.includes(randomItem)) {
      result.push(randomItem);
    }
  }

  return result;
}
export default ChatGuideBanner;
