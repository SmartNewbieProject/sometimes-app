import { DefaultLayout } from "@/src/features/layout/ui";
import { Header, Text } from "@/src/shared/ui";
import ChevronLeftIcon from "@assets/icons/chevron-left.svg";
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function Area() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <DefaultLayout style={{ paddingTop: insets.top, backgroundColor: "#fff" }}>
      <Header.Container className="border-b items-center border-b-[#E7E9EC]">
        <Header.CenterContent className=" pt-2">
          <Text textColor="black" size="20" weight="bold">
            지역 선택하기
          </Text>
        </Header.CenterContent>
      </Header.Container>
      <View>
        <Text
          size="20"
          weight="semibold"
          textColor={"black"}
          style={styles.title}
        >
          어느 지역에서 만남을 시작할까요?
        </Text>
        <Text size="13" weight="light" textColor={"light"} style={styles.desc}>
          현재 거주하거나 학교가 있는 지역을 선택해주세요
        </Text>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 10,
  },
  desc: {
    lineHeight: 16,
    marginBottom: 16,
  },
});

export default Area;
