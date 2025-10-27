import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function NotSome() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/no-some-post-miho.png")}
        style={styles.image}
      />
      <Text style={styles.description}>아직 도착한 썸이 없어요</Text>
      <Text style={styles.description}>좋아요를 보내 관심을 표현해 보세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 200,
  },
  image: {
    width: 216,
    height: 216,
  },
  description: {
    color: "#E1D9FF",
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
    fontSize: 18,
    lineHeight: 24,
  },
});

export default NotSome;
