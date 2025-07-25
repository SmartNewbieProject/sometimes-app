import { useRematchingTickets } from "@/src/features/mypage/queries";
import { Header, Text } from "@/src/shared/ui";
import ChevronLeftIcon from "@assets/icons/chevron-left.svg";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
export default function MatchingHistoryLayoutScreen() {
  const router = useRouter();
  const { data: rematching } = useRematchingTickets();
  return (
    <View className="flex-1">
      <Header.Container className="border-b items-center border-b-[#E7E9EC]">
        <Header.LeftContent>
          <Pressable
            onPress={() => router.navigate("/")}
            className="pt-2 -ml-2"
          >
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent className=" pt-2">
          <Text textColor="black" size="20" weight="bold">
            이전매칭
          </Text>
        </Header.CenterContent>
        <Header.RightContent>
          <Pressable
            onPress={() => router.push("/purchase/tickets/rematch")}
            style={styles.rematchingContainer}
          >
            <Text
              numberofLine={1}
              textColor={"black"}
              size={"13"}
              style={styles.rematchingCount}
            >
              {rematching?.total ?? 0}개
            </Text>
            <Image
              source={require("@assets/icons/rematching.png")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>
        </Header.RightContent>
      </Header.Container>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#fff",
            },
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  rematchingContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    backgroundColor: "#F5F1FF",
    borderRadius: 9,
    position: "absolute",
    right: 0,
    top: -11,
    gap: 5,
    paddingVertical: 1,
    minWidth: 64,
    alignItems: "center",
  },
  rematchingCount: {
    lineHeight: 22,
  },
});
