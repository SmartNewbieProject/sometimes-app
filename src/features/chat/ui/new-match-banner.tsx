import BackgroundHeartIcon from "@assets/icons/new-chat-banner-heart.svg";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import useChatRoomDetail from "../queries/use-chat-room-detail";
function NewMatchBanner() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = useChatRoomDetail(id);
  const name = data?.partner.name ?? "썸타임";
  return (
    <View style={styles.container}>
      <View style={{ position: "relative" }}>
        <BackgroundHeartIcon />
        <Image
          source={require("@assets/images/letter.png")}
          style={styles.letterImage}
        />
      </View>
      <Text style={styles.title}>
        축하드려요! <Text style={[styles.title, styles.name]}>{name}</Text>님과
        매칭되었습니다
      </Text>
      <Text style={styles.subText}>서로에게 관심을 보였어요!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: "#FDFBFF",
    borderRadius: 10,
    marginHorizontal: 16,
    alignItems: "center",
    gap: 1,

    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#7A4AE266",
  },
  letterImage: {
    width: 34,
    top: 7,
    left: 8,
    height: 34,
    position: "absolute",
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 27,
    color: "#000",
  },
  name: {
    color: "#7A4AE2",
    fontWeight: "800",
    fontFamily: "Pretendard-ExtraBold",
  },
  subText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#898A8D",
  },
});

export default NewMatchBanner;
