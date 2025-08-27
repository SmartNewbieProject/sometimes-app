import ChevronLeft from "@assets/icons/chevron-left.svg";
import VerticalEllipsisIcon from "@assets/icons/vertical-ellipsis.svg";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ChatMenuModal from "./menu-modal";
function ChatRoomHeader() {
  const router = useRouter();
  const [isVisible, setVisible] = useState(false);
  return (
    <View style={[styles.container]}>
      <ChatMenuModal visible={isVisible} onClose={() => setVisible(false)} />
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
      <Pressable
        style={{
          width: 36,
          height: 36,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => setVisible(true)}
      >
        <VerticalEllipsisIcon />
      </Pressable>
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
    flex: 1,

    gap: 2,
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
