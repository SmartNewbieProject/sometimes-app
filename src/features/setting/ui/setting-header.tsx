import { useModal } from "@/src/shared/hooks/use-modal";
import { Header } from "@/src/shared/ui";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMyInfoForm } from "../../my-info/hooks";

function SettingHeader() {
  const router = useRouter();
  const path = usePathname();
  const title = path === "/setting" ? "설정" : "계정관리";

  return (
    <Header.Container className="items-center  ">
      <Header.LeftContent>
        <Pressable
          onPress={() => {
            router.back();
          }}
          style={styles.arrowContainer}
        >
          <View style={styles.backArrow} />
        </Pressable>
      </Header.LeftContent>
      <Header.CenterContent>
        <Text style={styles.headerTitle}>{title}</Text>
      </Header.CenterContent>

      <Header.RightContent>
        <View />
      </Header.RightContent>
    </Header.Container>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: "#000",
    fontSize: 20,
    fontFamily: "Pretendard-Bold",
    lineHeight: 22,
  },
  backArrow: {
    width: 12.6,
    height: 12.6,
    top: 3,
    left: 3,
    position: "absolute",
    borderLeftWidth: 2,
    borderLeftColor: "#000",
    borderTopWidth: 2,
    borderTopColor: "#000",
    transform: [{ rotate: "-45deg" }],
    borderRadius: 2,
  },
  arrowContainer: {
    width: 24,
    height: 24,
  },
});

export default SettingHeader;
