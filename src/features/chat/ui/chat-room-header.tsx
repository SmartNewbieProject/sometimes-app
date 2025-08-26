import ChevronLeft from "@assets/icons/chevron-left.svg";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function ChatRoomHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container]}>
      <Pressable onPress={() => router.back()}>
        <ChevronLeft width={20} height={20} />
      </Pressable>
      <Image source={""} style={styles.profileImage} />
      <View style={styles.profileContainer}>
        <Text style={styles.name}>맹구</Text>
        <View style={styles.schoolContainer}>
          <Text style={styles.school}>떡잎유치원</Text>
          <Text style={styles.school}>해바라기반</Text>
        </View>
      </View>
      <Link
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        href="/partner/ban-report"
      >
        <Image
          source={require("@/assets/icons/emergency.png")}
          style={styles.headerIcon}
        />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 68,
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  profileImage: {
    width: 34,
    marginLeft: 7,
    marginRight: 10,
    height: 34,
    borderRadius: 34,
  },
  headerIcon: {
    width: 24,
    height: 24,

    tintColor: "#000",
  },
  profileContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  name: {
    color: "#000",
    fontWeight: 700,
    fontFamily: "Pretendard-ExtraBold",
    fontSize: 18,
    lineHeight: 19,
  },
  school: {
    color: "#767676",
    fontSize: 13,
    lineHeight: 19,
  },
  schoolContainer: {
    flexDirection: "row",
    gap: 2,
  },
});

export default ChatRoomHeader;
