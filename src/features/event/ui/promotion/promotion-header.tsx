import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { semanticColors } from '@/src/shared/constants/colors';
import { Header } from "@/src/shared/ui";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function PromotionHeader() {
  const router = useRouter();
  return (
    <Header.Container>
      <Header.LeftContent>
        <Pressable onPress={() => router.navigate("/")} className="p-2 -ml-2">
          <ChevronLeftIcon width={24} height={24} />
        </Pressable>
      </Header.LeftContent>
      <Header.CenterContent>
        <Text style={styles.titleText}>프로모션 친구 초대</Text>
      </Header.CenterContent>
      <Header.RightContent>
        <View />
      </Header.RightContent>
    </Header.Container>
  );
}

const styles = StyleSheet.create({
  titleText: {
    color: semanticColors.text.primary,
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "Pretendard-Bold",
  },
});

export default PromotionHeader;
