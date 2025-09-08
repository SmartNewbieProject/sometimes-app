import ChevronLeft from "@assets/icons/chevron-left.svg";
import VerticalEllipsisIcon from "@assets/icons/vertical-ellipsis.svg";
import { Image } from "expo-image";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import useChatRoomDetail from "../queries/use-chat-room-detail";
import ChatMenuModal from "./menu-modal";
function ChatRoomHeader() {
  const router = useRouter();
  const [isVisible, setVisible] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: partner } = useChatRoomDetail(id);

  return (
    <View style={[styles.container]}>
      <ChatMenuModal visible={isVisible} onClose={() => setVisible(false)} />
      <Pressable onPress={() => router.navigate("/chat")}>
        <ChevronLeft width={20} height={20} />
      </Pressable>
      <Image
        source={partner?.partner.mainProfileImageUrl ?? ""}
        style={styles.profileImage}
      />
      <View style={styles.profileContainer}>
        <Text style={styles.name}>{partner?.partner.name}</Text>
        <View style={styles.schoolContainer}>
          <Text style={styles.school}>{partner?.partner.university}</Text>
          <Text style={styles.school}>{partner?.partner.department}</Text>
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
